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
type Product = {
  id: number
  name: string
  price: number
}

// --------------------
// API BASE
// --------------------
const BASE_URL = "http://88.222.242.12:1738"

// --------------------
// API FUNCTIONS (TRY–CATCH)
// --------------------
const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/api/products`)
    return res.data
  } catch (err: any) {
    console.error(err)
    throw new Error("Unable to load products")
  }
}

const fetchProductById = async (id: number): Promise<Product> => {
  try {
    const res = await axios.get(`${BASE_URL}/api/products/${id}`)
    return res.data
  } catch (err) {
    console.error(err)
    throw new Error("Unable to load product")
  }
}

const updateProduct = async (
  id: number,
  data: { name: string; price: number }
) => {
  try {
    await axios.patch(`${BASE_URL}/api/products/${id}`, data)
  } catch (err) {
    console.error(err)
    throw new Error("Failed to update product")
  }
}

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
  const queryClient = useQueryClient()

  // --------------------
  // FETCH PRODUCTS
  // --------------------
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  })

  // --------------------
  // DELETE (OPTIMISTIC)
// --------------------
  const deleteMutation = useMutation({
    mutationFn: removeProduct,

    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["products"] })

      const previous =
        queryClient.getQueryData<Product[]>(["products"])

      queryClient.setQueryData<Product[]>(["products"], (old) =>
        old?.filter((p) => p.id !== id)
      )

      return { previous }
    },

    onError: (err: any, _id, context) => {
      queryClient.setQueryData(
        ["products"],
        context?.previous
      )
      alert(err.message)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  // --------------------
  // UI STATES
  // --------------------
  if (isLoading) {
    return <p className="p-6">Loading products...</p>
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        <p className="font-bold">Error</p>
        <p>{(error as Error).message}</p>
      </div>
    )
  }

  // --------------------
  // UI
  // --------------------
  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      {products.length === 0 && (
        <p className="text-gray-500">No products found</p>
      )}

      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded flex justify-between"
        >
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="text-gray-500">${product.price}</p>
          </div>

          <div className="flex gap-2">
            <EditSheet productId={product.id} />

            <Button
              variant="destructive"
              onClick={() =>
                deleteMutation.mutate(product.id)
              }
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// --------------------
// EDIT SHEET
// --------------------
function EditSheet({ productId }: { productId: number }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    data: product,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: open,
  })

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  useEffect(() => {
    if (product) {
      setName(product.name)
      setPrice(String(product.price))
    }
  }, [product])

  const mutation = useMutation({
    mutationFn: () =>
      updateProduct(productId, {
        name,
        price: Number(price),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setOpen(false)
    },

    onError: (err: any) => {
      alert(err.message)
    },
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
          <p className="text-red-500 mt-4">
            {(error as Error).message}
          </p>
        )}

        <div className="space-y-4 mt-6">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Button onClick={() => mutation.mutate()}>
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
