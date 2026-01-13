import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

type Product = {
  id: number
  name: string
  price: number
  category: string
  stock: number
  description: string
}

const BASE_URL = "http://88.222.242.12:1738"



export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read query params
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
useEffect(() => {
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

postProducts()}, [])

  useEffect(() => {

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const query = new URLSearchParams()
        if (search) query.append("search", search)
        if (category) query.append("category", category)

        const res = await fetch(
          `${BASE_URL}/api/products?${query.toString()}`
        )

        if (!res.ok) {
          throw new Error("Failed to fetch products")
        }

        const json = await res.json()

        // API returns { data: [...] }
        setProducts(Array.isArray(json.data) ? json.data : [])
      } catch (err) {
        console.error(err)
        setError("Unable to load products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category])

  // Update URL
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      search: e.target.value,
      category,
    })
  }

  const onCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({
      search,
      category: e.target.value,
    })
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      {/* Search */}
      <input
        value={search}
        onChange={onSearchChange}
        placeholder="Search products..."
        className="border p-2 rounded w-full"
      />

      {/* Category */}
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

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found</p>
      )}

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
