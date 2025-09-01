import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "../../services/api";
import ImageUpload from "../ImageUpload";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
  age: z.coerce.number().int().min(18, "You must be 18 or older").max(99, "Age must be below 100"),
  bio: z.string().max(300).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  interests: z.string().optional()
}).refine((d) => d.password === d.confirm, {
  message: "Passwords must match",
  path: ["confirm"]
});

type FormValues = z.infer<typeof Schema>;

export default function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { interests: "" }
  });

  // Check if form is valid including photos
  const isFormValid = photos.length >= 2;

  async function onSubmit(values: FormValues) {
    // Check photos before submission
    if (photos.length < 2) {
      setServerError("Please upload at least 2 photos to continue");
      return;
    }

    setServerError(null);
    const interests = (values.interests || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 20);

    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.toLowerCase(),
        password: values.password,
        age: values.age,
        bio: values.bio?.trim() || undefined,
        location: values.location?.trim() || undefined,
        interests,
        photos
      };
      await signup(payload);
      // redirect or clear form after success
      window.location.href = "/";
    } catch (err: any) {
      setServerError(err?.response?.data?.error || "Unable to create your account");
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-3xl content-center px-6">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold">Create your profile</h1>
        <p className="helper mb-6">Set the tone for better matches. Fields marked with * are required.</p>

        {/* Error Banner */}
        {serverError && (
          <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Something went wrong</p>
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input className="input mt-1" placeholder="Jane Doe" {...register("name")} />
              {errors.name && <p className="helper text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email *</label>
              <input className="input mt-1" type="email" placeholder="jane@example.com" {...register("email")} />
              {errors.email && <p className="helper text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Password *</label>
              <div className="relative mt-1">
                <input className="input pr-10" type={show ? "text" : "password"} placeholder="At least 8 characters" {...register("password")} />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="helper text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm password *</label>
              <input className="input mt-1" type="password" {...register("confirm")} />
              {errors.confirm && <p className="helper text-red-600">{errors.confirm.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="label">Age *</label>
              <input className="input mt-1" type="number" min={18} max={99} placeholder="28" {...register("age")} />
              {errors.age && <p className="helper text-red-600">{errors.age.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Location</label>
              <input className="input mt-1" placeholder="City, Country" {...register("location")} />
              {errors.location && <p className="helper text-red-600">{errors.location.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Short bio</label>
            <textarea className="input mt-1 min-h-[96px]" placeholder="Say something that shows who you are" {...register("bio")} />
            {errors.bio && <p className="helper text-red-600">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="label">Interests</label>
            <input className="input mt-1" placeholder="hiking, design, jazz" {...register("interests")} />
            <p className="helper">Comma separated, up to 20.</p>
          </div>

          <ImageUpload onChange={setPhotos} />
          
          {/* Photo validation feedback */}
          {photos.length < 2 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                Photos required: {photos.length}/2 uploaded. Please add {2 - photos.length} more photo(s) to continue.
              </p>
            </div>
          )}
          
          {photos.length >= 2 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-700">
                ✓ Photos ready: {photos.length} photos uploaded
              </p>
            </div>
          )}

          <div className="pt-2">
            <button 
              className="btn w-full" 
              type="submit" 
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}