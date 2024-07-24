import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

interface IUser {
  name: string;
  email: string;
  password: string;
  image: string;
  places: string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
