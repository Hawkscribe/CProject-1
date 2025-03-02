import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,  // Fixed typo: 'required' instead of 'reuired'
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,  // Fixed typo: 'required' instead of 'reuired'
    },
    type: {
        type: String,
        required: true,
        enum: ['follow', 'like'],  // Fixed typo: 'enums' should be 'enum'
    },
    read: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });  // Fixed typo: 'timestamp' should be 'timestamps'

const Notification = mongoose.model('Notification', notificationSchema);  // Fixed typo in model name

export default Notification;
