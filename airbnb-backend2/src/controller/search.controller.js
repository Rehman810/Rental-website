import Listing from '../model/listingModel/index.js';
import ConfirmedBooking from '../model/confirmBooking/index.js';

export const searchListings = async (req, res) => {
    try {
        const {
            q,
            minPrice,
            maxPrice,
            guests,
            amenities,
            checkIn,
            checkOut,
            bounds, // { north, south, east, west }
            polygon, // GeoJSON coordinates for polygon
            sortBy,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        // Text Search (updated to be more inclusive and handle "City, Country" format)
        if (q) {
            // If the query is "Karachi, Pakistan", users likely want "Karachi"
            // We split by comma and take the first part, or use the whole string if no comma
            const searchTerm = q.includes(',') ? q.split(',')[0].trim() : q;

            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { city: { $regex: searchTerm, $options: 'i' } },
                { town: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Availability Filter
        if (checkIn && checkOut) {
            const startDate = new Date(checkIn);
            const endDate = new Date(checkOut);

            if (!isNaN(startDate) && !isNaN(endDate)) {
                const overlapBookings = await ConfirmedBooking.find({
                    $or: [
                        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
                    ]
                }).select('listingId');

                const bookedListingIds = overlapBookings.map(b => b.listingId);

                if (bookedListingIds.length > 0) {
                    query._id = { $nin: bookedListingIds };
                }
            }
        }

        // Price Range
        if (minPrice || maxPrice) {
            query.weekdayActualPrice = {};
            if (minPrice) query.weekdayActualPrice.$gte = Number(minPrice);
            if (maxPrice) query.weekdayActualPrice.$lte = Number(maxPrice);
        }

        // Guests
        if (guests) {
            query.guestCapacity = { $gte: Number(guests) };
        }

        // Amenities
        if (amenities) {
            const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
            if (amenitiesList.length > 0) {
                // Build regex for case-insensitive amenity matching
                const regexAmenities = amenitiesList.map(a => new RegExp(a, 'i'));
                query.amenities = { $all: regexAmenities };
            }
        }

        // Geospatial Search
        if (polygon) {
            try {
                // Expected polygon format: [[lat, lng], [lat, lng], ...]
                // GeoJSON Polygon expects: [[[lng, lat], [lng, lat], ...]] (Note: lng first)
                let polyCoords = typeof polygon === 'string' ? JSON.parse(polygon) : polygon;

                // Ensure closed loop
                if (polyCoords.length > 0) {
                    const first = polyCoords[0];
                    const last = polyCoords[polyCoords.length - 1];
                    if (first[0] !== last[0] || first[1] !== last[1]) {
                        polyCoords.push(first);
                    }
                }

                // Convert [lat, lng] to [lng, lat] for GeoJSON if needed
                // Leaflet often gives [lat, lng]. GeoJSON needs [lng, lat].
                // We assume input is likely [lat, lng] from frontend.
                const geoJsonCoords = polyCoords.map(p => [p[1], p[0]]);

                query.location = {
                    $geoWithin: {
                        $geometry: {
                            type: "Polygon",
                            coordinates: [geoJsonCoords]
                        }
                    }
                };
            } catch (e) {
                console.error("Invalid polygon", e);
            }
        } else if (bounds) {
            try {
                const { north, south, east, west } = typeof bounds === 'string' ? JSON.parse(bounds) : bounds;
                if (north && south && east && west) {
                    query.location = {
                        $geoWithin: {
                            $box: [
                                [Number(west), Number(south)], // Bottom-Left (lng, lat)
                                [Number(east), Number(north)]  // Top-Right (lng, lat)
                            ]
                        }
                    };
                }
            } catch (e) { console.error("Invalid bounds", e); }
        }

        const sortOptions = {};
        if (sortBy === 'priceLow') sortOptions.weekdayActualPrice = 1;
        else if (sortBy === 'priceHigh') sortOptions.weekdayActualPrice = -1;

        const listings = await Listing.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Listing.countDocuments(query);

        res.status(200).json({
            success: true,
            results: listings,
            totalCount: total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};

export const aiSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "Query required" });

        const filters = {
            guests: 1,
            minPrice: 0,
            maxPrice: 10000000,
            amenities: [],
            q: ""
        };

        const lowerQ = query.toLowerCase();

        // 1. Extract Guests
        const guestMatch = lowerQ.match(/(\d+)\s*(?:people|guests|persons)/);
        if (guestMatch) filters.guests = parseInt(guestMatch[1]);

        const familyMatch = lowerQ.includes("family");
        if (familyMatch && !guestMatch) filters.guests = 4;

        // 2. Extract Price
        const priceUnder = lowerQ.match(/under\s*(\d+)(?:k)?/);
        if (priceUnder) {
            let amount = parseInt(priceUnder[1]);
            // Heuristic: if user types "10", they might mean "10k" depending on context, but "10k" is explicit.
            if (lowerQ.includes(amount + "k")) {
                amount *= 1000;
            } else if (amount < 500) {
                // unlikely to look for a place under 500 rupees/dollars without k usually? 
                // Assuming raw number 
            }
            filters.maxPrice = amount;
        }

        // 3. Extract Amenities
        if (lowerQ.includes("wifi")) filters.amenities.push("wifi");
        if (lowerQ.includes("pool")) filters.amenities.push("pool");
        if (lowerQ.includes("ac") || lowerQ.includes("air") || lowerQ.includes("condition")) filters.amenities.push("AC");
        if (lowerQ.includes("parking")) filters.amenities.push("parking");

        // 4. Extract Location - simple keyword search
        // We will just pass the whole query as 'q' but maybe clean it up?
        // Actually, let's just pick out known cities/areas if possible.
        // For now, we utilize the general text search with the query minus stop words?
        // Let's rely on the text search in `Listing` for the area name.
        filters.q = query;

        // "Safe area" heuristic
        let sortRecommended = false;
        if (lowerQ.includes("safe") || lowerQ.includes("secure")) {
            sortRecommended = true;
        }

        // Execute Search
        const dbQuery = {};
        if (filters.guests) dbQuery.guestCapacity = { $gte: filters.guests };
        if (filters.maxPrice < 10000000) dbQuery.weekdayActualPrice = { $lte: filters.maxPrice };

        // Use text search for the query, but try to match against town/city specifically if possible
        // For simplicity, we just text search the whole string against title/city/town
        dbQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { city: { $regex: query, $options: 'i' } },
            { town: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];

        if (filters.amenities.length > 0) {
            const regexAmenities = filters.amenities.map(a => new RegExp(a, 'i'));
            dbQuery.amenities = { $all: regexAmenities };
        }

        let queryObj = Listing.find(dbQuery);

        // Sorting
        // if sortRecommended, maybe sort by higher price (premium -> safe?) or just default
        if (sortRecommended) {
            // Placeholder: maybe implementing real 'safe' score later
        }

        const results = await queryObj.limit(10);

        res.json({
            success: true,
            parsedFilters: filters,
            results
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "AI Search failed" });
    }
}
