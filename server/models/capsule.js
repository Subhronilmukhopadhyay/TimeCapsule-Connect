import { Schema, model } from "mongoose";

const contentBlockSchema = new Schema ({
    type: { 
        type: String, 
        required: true,
    },
    children: {
        type: [Schema.Types.Mixed], 
        required: true,
    },
    url: {
        type: String,
    },
    name: {
        type: String,
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
}, { _id: false });

const capsuleSchema = new Schema ({
    _id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type:[contentBlockSchema],
        default: [],
    },
    lastEdited: {
        type: Date,
        default: Date.now,
    },
    locked: {
        type: Boolean,
        default: false,
    },
    lockDate: {
        type: Date,
    },
    lockLocation: {
        type: String,
    },
    coordinates: {
        lat: {
            type: Number,
            min: -90,
            max: 90,
        },
        lng: {
            type: Number,
            min: -180,
            max: 180,
         },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isCollab: {
        type: Boolean,
        default: false,
    },
    collaborators: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
})

const Capsule = model('Capsule', capsuleSchema);
export default Capsule;