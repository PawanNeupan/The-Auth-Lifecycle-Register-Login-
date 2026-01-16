import { useState } from "react"
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import axios from "axios"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

import { Button } from "@/components/ui/button"

// --------------------
// TYPES
// --------------------
// Define the Product type to match your backend schema
type Product = {
  id: number
  name: string
  price: number
  category: string
  stock: number
  description: string
}

// --------------------
// API BASE
// --------------------
const BASE_URL = "http://88.222.242.12:1738"

// --------------------
// API FUNCTIONS
// --------------------
// Fetch all products
const fetchProducts = async (): Promise<Product[]> => {
  const res = await axios.get(`${BASE_URL}/api/products`)
  return res.data
}

// Delete a single product by ID
const removeProduct = async (id: number) => {
  await axios.delete(`${BASE_URL}/api/products/${id}`)
}

// --------------------
// MAIN COMPONENT
// --------------------
export default function Product() {
  const queryClient = useQueryClient() // React Query client for cache management
  const [selectedIds, setSelectedIds] = useState<number[]>([]) // Track selected product IDs for bulk delete

  // --------------------
  // FETCH PRODUCTS
  // --------------------
  const {
    data: products = [], // products data (default empty array)
    isLoading,           // loading state
    isError,             // error state
    error,               // error object
  } = useQuery({
    queryKey: ["products"], // cache key
    queryFn: fetchProducts, // fetch function
  })

  // --------------------
  // SINGLE DELETE
  // --------------------
  const deleteMutation = useMutation({
    mutationFn: removeProduct, // function to delete one product
    onMutate: () => NProgress.start(), // show progress bar when mutation starts
    onSettled: () => {
      NProgress.done() // stop progress bar when mutation finishes
      queryClient.invalidateQueries({ queryKey: ["products"] }) // refresh product list
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Delete failed") // show error message
    },
  })

  // --------------------
  // BULK DELETE
  // --------------------
  const bulkDelete = async () => {
    try {
      NProgress.start() // start progress bar
      // Delete all selected products in parallel
      await Promise.all(selectedIds.map((id) => removeProduct(id)))
      queryClient.invalidateQueries({ queryKey: ["products"] }) // refresh product list
      setSelectedIds([]) // clear selection
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bulk delete failed")
    } finally {
      NProgress.done() // stop progress bar
    }
  }

  // --------------------
  // UI STATES
  // --------------------
  if (isLoading) return <p>Loading products...</p> // show loading state
  if (isError) {
    const message =
      error instanceof Error ? error.message : "Unknown error"
    return (
      <div className="text-red-600">
        <p className="font-bold">Error</p>
        <p>{message}</p>
      </div>
    )
  }

  // --------------------
  // UI
  // --------------------
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      {/* Show message if no products */}
      {products.length === 0 && (
        <p className="text-gray-500">No products found</p>
      )}

      {/* Bulk delete button */}
      <div className="flex justify-between items-center">
        <Button
          variant="destructive"
          disabled={selectedIds.length === 0} // disable if nothing selected
          onClick={bulkDelete}
        >
          Delete Selected ({selectedIds.length})
        </Button>
      </div>

      {/* Render product list */}
      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            {/* Checkbox for bulk selection */}
            <input
              type="checkbox"
              checked={selectedIds.includes(product.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds((prev) => [...prev, product.id]) // add ID
                } else {
                  setSelectedIds((prev) =>
                    prev.filter((id) => id !== product.id) // remove ID
                  )
                }
              }}
            />
            {/* Product details */}
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-gray-500">${product.price}</p>
              <p className="text-sm text-gray-400">
                {product.category} | Stock: {product.stock}
              </p>
              <p className="text-xs text-gray-400">
                {product.description}
              </p>
            </div>
          </div>

          {/* Single delete button */}
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate(product.id)}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}
