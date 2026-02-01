import Wishlist from '../../model/wishlist/index.js';
import Listing from '../../model/listingModel/index.js';

export const wishlistController = {
    getWishlist: async (req, res) => {
        try {
            const userId = req.user._id;
            let wishlist = await Wishlist.findOne({ userId }).populate('items.itemId');

            if (!wishlist) {
                return res.status(200).json({ items: [] });
            }

            // Filter out items where the listing might have been deleted (itemId is null)
            const validItems = wishlist.items.filter(item => item.itemId !== null);

            // If we filtered any out, we should probably update the wishlist, but for now just return valid ones
            // Actually, let's clean up the db if we find nulls? Maybe later.

            // We want to return listing objects directly to match frontend expectations?
            // Or return the structure { itemId: listing, type: ... }?
            // The prompt says "Return wishlist items ... Response: { items: [{ itemId: '123', type: 'property' }] }" 
            // But also checks existing UI compatibility.
            // I will return the structure as is, and let Frontend adapt.

            res.status(200).json({ items: validItems });
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    addItem: async (req, res) => {
        try {
            const userId = req.user._id;
            const { itemId, type } = req.body;

            if (!itemId) {
                return res.status(400).json({ message: 'Item ID is required' });
            }

            // Check if listing exists
            const listing = await Listing.findById(itemId);
            if (!listing) {
                return res.status(404).json({ message: 'Listing not found' });
            }

            let wishlist = await Wishlist.findOne({ userId });

            if (!wishlist) {
                wishlist = new Wishlist({ userId, items: [] });
            }

            //Check if item already exists
            const exists = wishlist.items.some(item => item.itemId.toString() === itemId);

            if (!exists) {
                wishlist.items.push({
                    itemId,
                    type: type || 'property',
                    addedAt: new Date()
                });
                await wishlist.save();
            }

            // Populate to return full object
            await wishlist.populate('items.itemId');

            res.status(200).json({ items: wishlist.items });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    removeItem: async (req, res) => {
        try {
            const userId = req.user._id;
            const { itemId } = req.params;

            const wishlist = await Wishlist.findOneAndUpdate(
                { userId },
                { $pull: { items: { itemId: itemId } } },
                { new: true }
            ).populate('items.itemId');

            res.status(200).json({ items: wishlist ? wishlist.items : [] });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    clearWishlist: async (req, res) => {
        try {
            const userId = req.user._id;
            await Wishlist.findOneAndUpdate({ userId }, { $set: { items: [] } });
            res.status(200).json({ items: [] });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
