import CancellationPolicy from '../../model/cancellationPolicy/index.js';

export const getPolicies = async (req, res) => {
    try {
        const userId = req.user._id;
        const policies = await CancellationPolicy.find({
            $or: [
                { type: 'PREDEFINED' },
                { type: 'CUSTOM', createdBy: userId }
            ],
            isActive: true
        });
        return res.status(200).json(policies);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const createCustomPolicy = async (req, res) => {
    try {
        const { name, description, rules } = req.body;
        const userId = req.user._id;

        // Validate rules manually if needed, but schema handles types.
        // Ensure logical consistency? e.g. not full refund after checkin if no refund after checkin is true

        const newPolicy = new CancellationPolicy({
            type: 'CUSTOM',
            name,
            description,
            rules,
            createdBy: userId
        });

        await newPolicy.save();
        return res.status(201).json(newPolicy);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
