import Host from '../../model/hostModel/index.js';
import Listing from '../../model/listingModel/index.js';
import Review from '../../model/reviewListings/index.js';
import GuestReview from '../../model/guestReview/index.js';
import ConfirmedBooking from '../../model/confirmBooking/index.js';
import mongoose from 'mongoose';

export const getHostProfile = async (req, res) => {
    try {
        const { hostId } = req.params;

        // Find Host
        const host = await Host.findById(hostId).select('-password -emailVerifyCode -emailVerifyExpiry -verifyCode -verifyToken');
        if (!host) {
            return res.status(404).json({ message: 'Host not found' });
        }

        // Find Listings
        const listings = await Listing.find({ hostId, status: 'active' });

        // Find Reviews for Listings
        const listingIds = listings.map(l => l._id);
        const reviews = await Review.find({ listingId: { $in: listingIds } })
            .populate('guestId', 'userName photoProfile') // Populate reviewer details
            .sort({ createdAt: -1 });

        // Aggregate Stats
        const totalListings = listings.length;
        const totalBookings = await ConfirmedBooking.countDocuments({ listingId: { $in: listingIds }, status: { $in: ['CONFIRMED', 'COMPLETED'] } });
        const reviewsCount = reviews.length;

        // Calculate Average Rating
        const totalRating = reviews.reduce((sum, r) => sum + r.overallRating, 0);
        const averageRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 0;

        // Build Response Object
        const profile = {
            _id: host._id,
            userName: host.userName,
            photoProfile: host.photoProfile,
            joinedDate: host.createdAt,
            isVerified: host.isVerify,
            bio: "Detailed bio section coming soon...", // Placeholder as schema lacks bio
            stats: {
                totalListings,
                totalBookings,
                reviewsCount,
                averageRating,
                responseRate: '100%', // Mocked for now
                responseTime: 'Within 1 hour' // Mocked for now
            },
            listings: listings.map(l => ({
                _id: l._id,
                title: l.title,
                photos: l.photos,
                price: l.weekdayActualPrice || l.weekendActualPrice, // Fallback logic
                ratingAvg: l.ratingAvg,
                location: l.city || l.town,
                placeType: l.placeType,
                roomType: l.roomType
            })),
            reviews: reviews.map(r => ({
                _id: r._id,
                rating: r.overallRating,
                comment: r.comment,
                createdAt: r.createdAt,
                guest: {
                    userName: r.guestId?.userName || 'Anonymous',
                    photoProfile: r.guestId?.photoProfile || ''
                }
            }))
        };

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching host profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getGuestProfile = async (req, res) => {
    try {
        const { guestId } = req.params;

        // Find Guest
        const guest = await Host.findById(guestId).select('-password -emailVerifyCode -emailVerifyExpiry -verifyCode -verifyToken');
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        // Find Confirmed Trips
        const trips = await ConfirmedBooking.find({ userId: guestId, status: { $in: ['COMPLETED', 'CONFIRMED'] } });
        const totalTrips = trips.length;

        // Find Cancellations
        const cancellations = await ConfirmedBooking.countDocuments({ userId: guestId, status: 'CANCELLED' });

        // Find Reviews Received from Hosts
        const reviews = await GuestReview.find({ guestId })
            .populate('hostId', 'userName photoProfile')
            .sort({ createdAt: -1 });

        // Build Response Object
        const profile = {
            _id: guest._id,
            userName: guest.userName,
            photoProfile: guest.photoProfile,
            joinedDate: guest.createdAt,
            isVerified: guest.isVerify,
            bio: "Traveler bio coming soon...", // Placeholder
            stats: {
                totalTrips,
                cancellations, // Only show if policy allows, assuming yes for now or filtered by viewer
                reviewsCount: reviews.length
            },
            reviews: reviews.map(r => ({
                _id: r._id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
                host: {
                    userName: r.hostId?.userName || 'Host',
                    photoProfile: r.hostId?.photoProfile || ''
                }
            }))
        };

        res.status(200).json(profile);

    } catch (error) {
        console.error('Error fetching guest profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
