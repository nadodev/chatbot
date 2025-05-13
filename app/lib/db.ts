import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Function to get all products
export async function getAllProducts() {
  try {
    const products = await prisma.products.findMany();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Function to get product by ID
export async function getProductById(id: number) {
  try {
    const product = await prisma.products.findUnique({
      where: { id },
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// Function to create a new product
export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  in_stock?: boolean;
}) {
  try {
    const product = await prisma.products.create({
      data,
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Function to update a product
export async function updateProduct(id: number, data: {
  name?: string;
  description?: string;
  price?: number;
  in_stock?: boolean;
}) {
  try {
    const product = await prisma.products.update({
      where: { id },
      data,
    });
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Function to delete a product
export async function deleteProduct(id: number) {
  try {
    const product = await prisma.products.delete({
      where: { id },
    });
    return product;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Function to get AI response about products
export async function getProductResponse(question: string) {
  try {
    const products = await getAllProducts();
    const productsText = products.map(p => 
      `Product: ${p.name}\nDescription: ${p.description || 'N/A'}\nPrice: $${p.price}\nIn Stock: ${p.in_stock}\n`
    ).join('\n');

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are a helpful assistant that provides information about products.
      Use the following product information to answer the user's question:
      
      ${productsText}
      
      User question: ${question}
      
      Please provide a helpful response based on the product information above.
      Format the response in a clear and organized way.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response from AI model");
    }

    return text;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

export default prisma; 