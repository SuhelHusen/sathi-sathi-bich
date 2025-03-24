export interface Person {
  id: string
  name: string
}

export interface Item {
  id: string
  name: string
  price: number
  quantity?: number
  pricePerUnit?: number
  assignedTo: string[] // Array of person IDs
}

