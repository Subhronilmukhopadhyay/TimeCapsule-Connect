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
    inMaking: {
        type: Boolean,
        default: true,
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
    // 👇 GeoJSON-compatible coordinates for geospatial queries
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            // default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            validate: {
                validator: function (val) {
                    return val.length === 2 &&
                        val[0] >= -180 && val[0] <= 180 &&  // lng
                        val[1] >= -90 && val[1] <= 90;     // lat
                },
                message: props => `${props.value} is not a valid [lng, lat] coordinate pair`
            }
        }
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
    owner: {
        type: Number,
        required: true,
        index: true
    },
})

// 👇 Geospatial index for coordinates
capsuleSchema.index({ coordinates: '2dsphere' }, { sparse: true }); 

const Capsule = model('Capsule', capsuleSchema);
export default Capsule;