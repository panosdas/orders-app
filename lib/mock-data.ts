import type { Table, Category, Product } from "./types"

export const mockWaiter = {
  id: "1",
  name: "Γιάννης",
}

export const mockTables: Table[] = [
  { id: "a1", name: "A1", customerName: "Ιωάννου", status: "active" },
  { id: "a2", name: "A2", status: "available" },
  { id: "a3", name: "A3", status: "active" },
  { id: "a4", name: "A4", customerName: "Γεωργίου", status: "active" },
  { id: "b1", name: "B1", status: "available" },
]

export const mockCategories: Category[] = [
  { id: "food", name: "Φαγητό" },
  { id: "drinks-individual", name: "Ποτά Ατομικά" },
  { id: "drinks-bottles", name: "Ποτά Μπουκάλια" },
  { id: "soft-drinks", name: "Αναψηκτικά-Χυμοί" },
  { id: "sides", name: "Συνοδευτικά" },
]

export const mockProducts: Product[] = [
  // Φαγητό
  { id: "p1", name: "Μουσακάς", price: 12, categoryId: "food" },
  { id: "p2", name: "Σουβλάκι χοιρινό", price: 10, categoryId: "food" },
  { id: "p3", name: "Παστίτσιο", price: 11, categoryId: "food" },
  { id: "p4", name: "Κοτόπουλο σχάρας", price: 14, categoryId: "food" },
  
  // Ποτά Ατομικά
  { id: "p5", name: "Ούζο Πλωμαρίου", price: 5, categoryId: "drinks-individual" },
  { id: "p6", name: "Τσίπουρο", price: 4, categoryId: "drinks-individual" },
  { id: "p7", name: "Κρασί ποτήρι", price: 4, categoryId: "drinks-individual" },
  
  // Ποτά Μπουκάλια
  { id: "p8", name: "Jameson Μπουκάλι", price: 80, categoryId: "drinks-bottles" },
  { id: "p9", name: "Stolli Vodka Μπουκάλι", price: 80, categoryId: "drinks-bottles" },
  { id: "p10", name: "Jack Daniels Μπουκάλι", price: 90, categoryId: "drinks-bottles" },
  
  // Αναψηκτικά-Χυμοί
  { id: "p11", name: "Coca Cola", price: 4, categoryId: "soft-drinks" },
  { id: "p12", name: "Fanta", price: 4, categoryId: "soft-drinks" },
  { id: "p13", name: "Χυμός πορτοκάλι", price: 5, categoryId: "soft-drinks" },
  { id: "p14", name: "Νερό 500ml", price: 2, categoryId: "soft-drinks" },
  
  // Συνοδευτικά
  { id: "p15", name: "Πατάτες τηγανητές", price: 5, categoryId: "sides" },
  { id: "p16", name: "Σαλάτα χωριάτικη", price: 8, categoryId: "sides" },
  { id: "p17", name: "Τζατζίκι", price: 4, categoryId: "sides" },
]
