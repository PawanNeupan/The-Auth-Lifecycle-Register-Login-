import { useEffect, useState } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import axios from "axios"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// --------------------
// TYPES
// --------------------
// This defines the Product structure used in the app
type Product = {
  id: number
  name: string
  price: number
  category: string
  stock: number
  description: string
}

// --------------------
// API BASE URL
// --------------------
const BASE_URL = "http://88.222.242.12:1738"

// --------------------
// API FUNCTIONS
// --------------------

// Fetch all products from the backend
const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/api/products`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw new Error("Unable to load products") // Error displayed if API fails
  }
}

// Fetch a single product by ID
const fetchProductById = async (id: number): Promise<Product> => {
  try {
    const res = await axios.get(`${BASE_URL}/api/products/${id}`)
    return res.data
  } catch (err) {
    console.error(err)
    throw new Error("Unable to load product")
  }
}

// Update a product by ID with new data
const updateProduct = async (
  id: number,
  data: Partial<Product>
) => {
  try {
    await axios.patch(`${BASE_URL}/api/products/${id}`, data)
  } catch (err) {
    console.error(err)
    throw new Error("Failed to update product")
  }
}

// Delete a product by ID
const removeProduct = async (id: number) => {
  try {
    await axios.delete(`${BASE_URL}/api/products/${id}`)
  } catch (err) {
    console.error(err)
    throw new Error("Failed to delete product")
  }
}

// --------------------
// MAIN COMPONENT
// --------------------
export default function Product() {
  const queryClient = useQueryClient() // React Query's cache manager
  const [selectedIds, setSelectedIds] = useState<number[]>([]) // Stores IDs of selected products for bulk actions

  // -------------------- Fetch Products --------------------
  const {
    data: products = [], // Products from API
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"], // Key for caching
    queryFn: fetchProducts, // Function that fetches products
  })

  // -------------------- Optimistic Delete --------------------
  // Allows deleting a product immediately from UI, then syncing with API
  const deleteMutation = useMutation({
    mutationFn: removeProduct, // API call
    onMutate: async (id: number) => {
      // Cancel any ongoing queries for products
      await queryClient.cancelQueries({ queryKey: ["products"] })

      // Get the current list of products to rollback if needed
      const previous = queryClient.getQueryData<Product[]>(["products"])

      // Remove the product from the UI immediately (optimistic update)
      queryClient.setQueryData<Product[]>(["products"], (old) =>
        old?.filter((p) => p.id !== id)
      )

      return { previous } // Return previous data for rollback in case of error
    },
    onError: (err: any, _id, context) => {
      // Rollback to previous state if API fails
      queryClient.setQueryData(["products"], context?.previous)
      alert(err.message) // Show error
    },
    onSettled: () => {
      // Refresh product list after mutation, whether success or fail
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  // -------------------- Bulk Delete --------------------
  const bulkDelete = async () => {
    try {
      // Fire multiple DELETE requests simultaneously
      await Promise.all(selectedIds.map((id) => removeProduct(id)))
      setSelectedIds([]) // Clear selections
      queryClient.invalidateQueries({ queryKey: ["products"] }) // Refresh products
    } catch (err: any) {
      alert("Failed to delete selected products: " + err.message)
    }
  }

  // -------------------- UI STATES --------------------
  if (isLoading) return <p className="p-6">Loading products...</p>
  if (isError)
    return (
      <div className="p-6 text-red-600">
        <p className="font-bold">Error</p>
        <p>{(error as Error).message}</p>
      </div>
    )

  // -------------------- UI --------------------
  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      {/* Show bulk delete button if any products are selected */}
      {selectedIds.length > 0 && (
        <Button
          variant="destructive"
          onClick={bulkDelete}
          className="mb-4"
        >
          Delete Selected ({selectedIds.length})
        </Button>
      )}

      {products.length === 0 && (
        <p className="text-gray-500">No products found</p>
      )}

      {/* Product list */}
      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            {/* Checkbox for bulk actions */}
            <input
              type="checkbox"
              checked={selectedIds.includes(product.id)}
              onChange={() =>
                setSelectedIds((prev) =>
                  prev.includes(product.id)
                    ? prev.filter((x) => x !== product.id)
                    : [...prev, product.id]
                )
              }
            />
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-gray-500">${product.price}</p>
              <p className="text-gray-500">{product.category}</p>
              <p className="text-gray-500">Stock: {product.stock}</p>
              <p className="text-gray-500">{product.description}</p>
            </div>
          </div>

          {/* Edit and single delete buttons */}
          <div className="flex gap-2">
            <EditSheet productId={product.id} />
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(product.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// -------------------- EDIT SHEET --------------------
function EditSheet({ productId }: { productId: number }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false) // Sheet open/close state
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
  })

  // Fetch product when sheet opens
  const { data: product, isError, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: open, // Only fetch when open
  })

  // Populate form fields when product data is loaded
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: String(product.price),
        category: product.category,
        stock: String(product.stock),
        description: product.description,
      })
    }
  }, [product])

  // Mutation to update product
  const mutation = useMutation({
    mutationFn: () =>
      updateProduct(productId, {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        description: form.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] }) // Refresh products
      setOpen(false) // Close the sheet
    },
    onError: (err: any) => alert(err.message), // Show error if API fails
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Edit</Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
        </SheetHeader>

        {isError && (
          <p className="text-red-500 mt-4">{(error as Error).message}</p>
        )}

        <div className="space-y-4 mt-6">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          <Button onClick={() => mutation.mutate()}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
