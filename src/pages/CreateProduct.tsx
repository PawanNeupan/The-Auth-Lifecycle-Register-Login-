// --------------------
// IMPORTS
// --------------------
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"

// --------------------
// BACKEND BASE URL
// --------------------
const BASE_URL = "http://88.222.242.12:1738"

// --------------------
// ZOD SCHEMA
// (Must match Swagger Product schema)
// --------------------
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),

  price: z.number().min(0.01, "Price is required"),

  stock: z.number().min(0, "Stock is required"),
})

// TypeScript type from Zod schema
type ProductFormData = z.infer<typeof productSchema>

// --------------------
// COMPONENT
// --------------------
export default function CreateProduct() {
  // Wizard step (1 = Identity, 2 = Inventory)
  const [step, setStep] = useState<1 | 2>(1)

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      category: "",
      description: "",
      price: 0,
      stock: 0,
    },
  })

  // --------------------
  // FINAL SUBMIT HANDLER
  // --------------------
  const onSubmit = async (data: ProductFormData) => {
    try {
      await axios.post(`${BASE_URL}/api/products`, data)

      alert("✅ Product created successfully!")
    } catch (err: any) {
      /**
       * Backend validation error example:
       * {
       *   errors: [
       *     { field: "price", message: "Price must be a number" }
       *   ]
       * }
       */
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((e: any) => {
          setError(e.field, { message: e.message })
        })
      } else {
        alert("❌ Failed to create product")
      }
    }
  }

  // --------------------
  // UI
  // --------------------
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6">
        Create Product (Step {step}/2)
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            {/* Product Name */}
            <div>
              <input
                placeholder="Product Name"
                {...register("name")}
                className="border p-2 w-full rounded"
              />
              <p className="text-red-500 text-sm">
                {errors.name?.message}
              </p>
            </div>

            {/* Category */}
            <div>
              <input
                placeholder="Category"
                {...register("category")}
                className="border p-2 w-full rounded"
              />
              <p className="text-red-500 text-sm">
                {errors.category?.message}
              </p>
            </div>

            {/* Description */}
            <div>
              <textarea
                placeholder="Description"
                {...register("description")}
                className="border p-2 w-full rounded"
              />
              <p className="text-red-500 text-sm">
                {errors.description?.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next →
            </button>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <>
            {/* Price */}
            <div>
                <label>Price : </label>
              <input
                type="number"
                placeholder="Price"
                {...register("price", { valueAsNumber: true })}
                className="border p-2 w-full rounded"
              />
              <p className="text-red-500 text-sm">
                {errors.price?.message}
              </p>
            </div>

            {/* Stock */}
            <div>
                <label>Stock : </label>
              <input
                type="number"
                placeholder="Stock"
                {...register("stock", { valueAsNumber: true })}
                className="border p-2 w-full rounded"
              />
              <p className="text-red-500 text-sm">
                {errors.stock?.message}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="border px-4 py-2 rounded"
              >
                ← Back
              </button>

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Create Product
              </button>
            </div>
          </>
        )}

      </form>
    </div>
  )
}
