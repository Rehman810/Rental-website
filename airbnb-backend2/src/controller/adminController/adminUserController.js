import Host from '../../model/hostModel/index.js';
import ConfirmedBooking from '../../model/confirmBooking/index.js';
import Payment from '../../model/payment/index.js';
import AdminTransaction from '../../model/adminTransaction/index.js';

const adminUserController = {
    // 1. Get All Users (Guests)
    getUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

            const query = { role: 'guest' };

            // Search Logic
            if (search) {
                query.$or = [
                    { userName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    // Phone is number, tricky with regex, maybe exact match or ignore
                ];
            }

            // Filter Logic
            if (status && status !== 'all') {
                query.accountStatus = status;
            }

            // Sorting
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const skip = (page - 1) * limit;

            const users = await Host.find(query)
                .select('userName email phoneNumber accountStatus walletBalance createdAt updatedAt photoProfile')
                .sort(sortOptions)
                .skip(parseInt(skip))
                .limit(parseInt(limit));

            const totalCount = await Host.countDocuments(query);

            // Add aggregate data (total spend, total bookings) - separate queries or aggregation
            // For list view, maybe we can skip heavy aggregation or do a lookup
            // Doing a simple aggregation for the current page users
            const userIds = users.map(u => u._id);

            const bookingsCount = await ConfirmedBooking.aggregate([
                { $match: { userId: { $in: userIds } } },
                { $group: { _id: "$userId", count: { $sum: 1 } } }
            ]);

            const paymentsSum = await Payment.aggregate([
                { $match: { userId: { $in: userIds }, paymentStatus: 'succeeded' } },
                { $group: { _id: "$userId", totalSpend: { $sum: "$amount" } } }
            ]);

            const bookingsMap = {};
            bookingsCount.forEach(b => bookingsMap[b._id.toString()] = b.count);

            const spendMap = {};
            paymentsSum.forEach(p => spendMap[p._id.toString()] = p.totalSpend);

            const usersWithStats = users.map(user => ({
                ...user.toObject(),
                totalBookings: bookingsMap[user._id.toString()] || 0,
                totalSpend: spendMap[user._id.toString()] || 0,
                // lastActive: user.updatedAt // approx
            }));

            res.status(200).json({
                users: usersWithStats,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    // 2. Get User Details
    getUserDetails: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await Host.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Booking History
            const bookings = await ConfirmedBooking.find({ userId }).populate('listingId', 'title photos city country').sort({ createdAt: -1 });

            // Payment Summary
            const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
            const totalSpend = payments
                .filter(p => p.paymentStatus === 'succeeded')
                .reduce((sum, p) => sum + p.amount, 0);

            const refunds = payments
                // logic for identifying refunds if any, or check AdminTransactions
                .reduce((sum, p) => sum + (0), 0); // Placeholder unless payment model has refund field

            // Check Admin Transactions for credits/manual refunds
            const transactions = await AdminTransaction.find({ userId }).sort({ createdAt: -1 });

            res.status(200).json({
                user,
                bookings,
                payments: {
                    history: payments,
                    totalSpend,
                    totalRefunds: refunds // + transactions refunds
                },
                transactions,
                // reports: [] 
            });

        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    // 3. Suspend User
    suspendUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await Host.findByIdAndUpdate(userId, { accountStatus: 'suspended' }, { new: true });

            if (!user) return res.status(404).json({ message: 'User not found' });

            // Log Action
            await AdminTransaction.create({
                adminId: req.user._id, // Assumes req.user is set by auth middleware
                userId,
                action: 'SUSPEND',
                reason: 'Admin Action: Suspend',
            });

            res.status(200).json({ message: 'User suspended successfully', user });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    // 4. Ban User
    banUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await Host.findByIdAndUpdate(userId, { accountStatus: 'banned' }, { new: true });

            if (!user) return res.status(404).json({ message: 'User not found' });

            // Log Action
            await AdminTransaction.create({
                adminId: req.user._id,
                userId,
                action: 'BAN',
                reason: 'Admin Action: Ban',
            });

            res.status(200).json({ message: 'User banned successfully', user });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    // 5. Reactivate User
    reactivateUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await Host.findByIdAndUpdate(userId, { accountStatus: 'active' }, { new: true });

            if (!user) return res.status(404).json({ message: 'User not found' });

            // Log Action
            await AdminTransaction.create({
                adminId: req.user._id,
                userId,
                action: 'REACTIVATE',
                reason: 'Admin Action: Reactivate',
            });

            res.status(200).json({ message: 'User reactivated successfully', user });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    // 6. Manual Refund (To Wallet)
    issueRefund: async (req, res) => {
        try {
            const { userId } = req.params;
            const { amount, reason, bookingId } = req.body;

            if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount is required' });
            if (!reason) return res.status(400).json({ message: 'Reason is required' });

            const user = await Host.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Add to wallet
            user.walletBalance = (user.walletBalance || 0) + parseFloat(amount);
            await user.save();

            // Log Transaction
            await AdminTransaction.create({
                adminId: req.user._id,
                userId,
                action: 'REFUND',
                amount,
                reason,
                bookingId: bookingId || null
            });

            res.status(200).json({ message: 'Refund issued successfully', walletBalance: user.walletBalance });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    // 7. Manual Credit (To Wallet)
    issueCredit: async (req, res) => {
        try {
            const { userId } = req.params;
            const { amount, reason } = req.body;

            if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount is required' });
            if (!reason) return res.status(400).json({ message: 'Reason is required' });

            const user = await Host.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Add to wallet
            user.walletBalance = (user.walletBalance || 0) + parseFloat(amount);
            await user.save();

            // Log Transaction
            await AdminTransaction.create({
                adminId: req.user._id,
                userId,
                action: 'CREDIT',
                amount,
                reason
            });

            res.status(200).json({ message: 'Credit issued successfully', walletBalance: user.walletBalance });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

export default adminUserController;
