// React hooks for state management and side effects
import { useEffect, useState } from "react"

// Hook to read and update URL query parameters
import { useSearchParams } from "react-router-dom"

// TypeScript type for Product data
type Product = {
  id: number
  name: string
  price: number
  category: string
  stock: number
  description: string
}

// Backend base URL
const BASE_URL = "http://88.222.242.12:1738"

export default function Products() {

  // Hook to access and update URL search parameters (?search=&category=)
  const [searchParams, setSearchParams] = useSearchParams()

  // Read query params from URL
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""

  // State to store fetched products
  const [products, setProducts] = useState<Product[]>([])

  // State to handle loading state
  const [loading, setLoading] = useState(false)

  // State to handle error message
  const [error, setError] = useState<string | null>(null)

  // useEffect runs once on component mount
  // This is only for creating (POST) sample products in backend
  useEffect(() => {

    // Sample products to insert
    const products = [
      {
        name: "Laptop",
        price: 85000,
        category: "electronics",
        stock: 10,
        description: "Gaming laptop",
      },
      {
        name: "Mobile Phone",
        price: 30000,
        category: "electronics",
        stock: 25,
        description: "Android smartphone",
      },
    ]

    // Function to POST products to backend
    async function postProducts() {
      for (const product of products) {
        const res = await fetch(`${BASE_URL}/api/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        })

        const data = await res.json()
        console.log("Created:", data)
      }
    }

    postProducts()
  }, [])

  // useEffect runs whenever search or category changes
  // Fetch products from backend using query params
  useEffect(() => {

    const fetchProducts = async () => {
      try {
        setLoading(true)   // Start loading
        setError(null)     // Clear previous error

        // Build query parameters dynamically
        const query = new URLSearchParams()
        if (search) query.append("search", search)
        if (category) query.append("category", category)

        // Fetch products with server-side filtering
        const res = await fetch(
          `${BASE_URL}/api/products?${query.toString()}`
        )

        if (!res.ok) {
          throw new Error("Failed to fetch products")
        }

        const json = await res.json()

        // Backend returns { data: [...] }
        setProducts(Array.isArray(json.data) ? json.data : [])
      } catch (err) {
        console.error(err)
        setError("Unable to load products")
        setProducts([])
      } finally {
        setLoading(false) // Stop loading
      }
    }

    fetchProducts()
  }, [search, category])

  // Update URL when search input changes
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      search: e.target.value,
      category,
    })
  }

  // Update URL when category dropdown changes
  const onCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({
      search,
      category: e.target.value,
    })
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      {/* Search input */}
      <input
        value={search}
        onChange={onSearchChange}
        placeholder="Search products..."
        className="border p-2 rounded w-full"
      />

      {/* Category dropdown */}
      <select
        value={category}
        onChange={onCategoryChange}
        className="border p-2 rounded"
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="books">Books</option>
      </select>

      {/* Loading message */}
      {loading && <p>Loading...</p>}

      {/* Error message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* No data message */}
      {!loading && !error && products.length === 0 && (
        <p>No products found</p>
      )}

      {/* Product list */}
      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.category}</p>
            <p>Price: Rs. {p.price}</p>
            <p>Stock: {p.stock}</p>
            <p className="text-sm">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
