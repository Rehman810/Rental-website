import mongoose from "mongoose";
import Listing from "../../model/listingModel/index.js";
import TemporaryBooking from "../../model/temporaryBooking/index.js";
import ConfirmedBooking from "../../model/confirmBooking/index.js";

export const getHostAnalytics = async (req, res) => {
    try {
        const hostId = req.user._id;
        const { from, to, listingId, status, bookingMode } = req.query;

        // 1) Find all listings for this host
        const hostListings = await Listing.find({ hostId }).select("_id title photos");
        const hostListingIds = hostListings.map((l) => l._id);

        if (hostListingIds.length === 0) {
            return res.status(200).json({
                filters: { from, to, listingId, status, bookingMode },
                kpis: {
                    totalBookings: 0,
                    pendingRequests: 0,
                    upcomingBookings: 0,
                    currentlyHosting: 0,
                    confirmedBookings: 0,
                    cancelledOrExpiredBookings: 0,
                    totalGross: 0,
                    platformFeeTotal: 0,
                    hostNetEarnings: 0,
                    avgBookingValue: 0,
                },
                charts: { revenueByDate: [] },
                lists: { pendingBookings: [], activeBookings: [], topListings: [] },
            });
        }

        // 2) Build Filters (Safe listingId)
        const listingIdFilter =
            listingId &&
                mongoose.Types.ObjectId.isValid(listingId) &&
                hostListingIds.some((id) => id.toString() === listingId)
                ? [new mongoose.Types.ObjectId(listingId)]
                : hostListingIds;

        // 3) Date Filter (Safe)
        const dateFilter = {};
        if (from || to) {
            const startDateFilter = {};
            if (from && !isNaN(new Date(from))) startDateFilter.$gte = new Date(from);
            if (to && !isNaN(new Date(to))) startDateFilter.$lte = new Date(to);

            if (Object.keys(startDateFilter).length > 0) {
                dateFilter.startDate = startDateFilter;
            }
        }

        // 4) KPI: Pending Requests
        const pendingCount = await TemporaryBooking.countDocuments({
            listingId: { $in: listingIdFilter },
            status: "pending_approval",
        });

        // 5) Confirmed Query (for totals + chart + list)
        const confirmedQuery = {
            listingId: { $in: listingIdFilter },
            ...dateFilter,
        };

        const confirmedBookingsData = await ConfirmedBooking.find(confirmedQuery);

        const totalBookings = confirmedBookingsData.length;
        const totalGross = confirmedBookingsData.reduce(
            (acc, curr) => acc + (curr.totalPrice || 0),
            0
        );

        const platformFeeTotal = totalGross * 0.1;
        const hostNetEarnings = totalGross - platformFeeTotal;
        const avgBookingValue = totalBookings > 0 ? totalGross / totalBookings : 0;

        // 6) KPI: Upcoming & Currently Hosting (apply dateFilter too)
        const now = new Date();

        const upcomingCount = await ConfirmedBooking.countDocuments({
            listingId: { $in: listingIdFilter },
            startDate: { $gt: now },
            ...dateFilter,
        });

        const currentlyHostingCount = await ConfirmedBooking.countDocuments({
            listingId: { $in: listingIdFilter },
            startDate: { $lte: now },
            endDate: { $gte: now },
            ...dateFilter,
        });

        // 7) KPI: Expired Requests
        const expiredCount = await TemporaryBooking.countDocuments({
            listingId: { $in: listingIdFilter },
            status: "expired",
        });

        // 8) Charts: Revenue by Date (Safe sum)
        const revenueChart = await ConfirmedBooking.aggregate([
            { $match: confirmedQuery },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startDate" } },
                    dailyGross: { $sum: { $ifNull: ["$totalPrice", 0] } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    date: "$_id",
                    gross: "$dailyGross",
                    fee: { $multiply: ["$dailyGross", 0.1] },
                    net: { $multiply: ["$dailyGross", 0.9] },
                    bookings: "$count",
                    _id: 0,
                },
            },
        ]);

        // 9) Lists: Pending Bookings (populate safe fallback)
        let pBookings = [];
        try {
            pBookings = await TemporaryBooking.find({
                listingId: { $in: listingIdFilter },
                status: "pending_approval",
            })
                .populate("listingId", "title photos")
                .populate("userId", "userName photoProfile email")
                .sort({ createdAt: -1 })
                .limit(10);
        } catch (err) {
            console.log(
                "Populate failed for TemporaryBooking.userId, returning without user populate"
            );
            pBookings = await TemporaryBooking.find({
                listingId: { $in: listingIdFilter },
                status: "pending_approval",
            })
                .populate("listingId", "title photos")
                .sort({ createdAt: -1 })
                .limit(10);
        }

        // 10) Lists: Active/Confirmed Bookings (populate safe fallback)
        let cBookings = [];
        try {
            cBookings = await ConfirmedBooking.find(confirmedQuery)
                .populate("listingId", "title photos")
                .populate("userId", "userName photoProfile email")
                .sort({ startDate: -1 })
                .limit(10);
        } catch (err) {
            console.log(
                "Populate failed for ConfirmedBooking.userId, returning without user populate"
            );
            cBookings = await ConfirmedBooking.find(confirmedQuery)
                .populate("listingId", "title photos")
                .sort({ startDate: -1 })
                .limit(10);
        }

        // 11) Top Listings Performance
        const topListingsAgg = await ConfirmedBooking.aggregate([
            { $match: { listingId: { $in: listingIdFilter }, ...dateFilter } },
            {
                $group: {
                    _id: "$listingId",
                    grossEarnings: { $sum: { $ifNull: ["$totalPrice", 0] } },
                    bookingCount: { $sum: 1 },
                },
            },
            { $sort: { grossEarnings: -1 } },
            { $limit: 5 },
        ]);

        const topListings = await Listing.populate(topListingsAgg, {
            path: "_id",
            select: "title photos ratingAvg",
        });

        const formattedTopListings = topListings.map((item) => ({
            ...item,
            title: item._id?.title,
            photo: item._id?.photos ? item._id.photos[0] : null,
            rating: item._id?.ratingAvg,
            grossEarnings: item.grossEarnings,
            netEarnings: item.grossEarnings * 0.9,
            bookingCount: item.bookingCount,
        }));

        // 12) Response
        return res.status(200).json({
            filters: { from, to, listingId, status, bookingMode },
            kpis: {
                totalBookings,
                pendingRequests: pendingCount,
                upcomingBookings: upcomingCount,
                currentlyHosting: currentlyHostingCount,
                confirmedBookings: totalBookings,
                cancelledOrExpiredBookings: expiredCount,
                totalGross,
                platformFeeTotal,
                hostNetEarnings,
                avgBookingValue,
            },
            charts: {
                revenueByDate: revenueChart,
            },
            lists: {
                pendingBookings: pBookings,
                activeBookings: cBookings,
                topListings: formattedTopListings,
            },
        });
    } catch (error) {
        console.error("Host Dashboard Analytics Error:", error);
        return res.status(500).json({ message: "Server error fetching analytics" });
    }
};
