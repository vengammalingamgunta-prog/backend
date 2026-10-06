import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        schemeCode: {
            type: String,
            required: true
        },

        schemeName: {
            type: String,
            required: true
        },

        investmentType: {
            type: String,
            required: true,
            enum: ["lumpsum", "sip"]
        },

        // Used for one-time investment
        investmentAmount: {
            type: Number,
            min: 0
        },

        investmentDate: {
            type: Date
        },

        // Used for SIP
        monthlyAmount: {
            type: Number,
            min: 0
        },

        startDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Investment = mongoose.model('Investment', investmentSchema);
export default Investment;