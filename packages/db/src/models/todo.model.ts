import { Schema, model } from 'mongoose';

const TodoSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 5000,
        },
        done: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

const Todo = model('Todo', TodoSchema);

export default Todo;
