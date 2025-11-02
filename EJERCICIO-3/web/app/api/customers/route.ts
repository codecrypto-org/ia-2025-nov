import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Customer } from '@/types/customer';

// GET /api/customers - List all customers
export async function GET() {
  try {
    const result = await pool.query<Customer>(
      'SELECT * FROM customers ORDER BY customer_id'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      company_name,
      contact_name,
      contact_title,
      address,
      city,
      region,
      postal_code,
      country,
      phone,
      fax,
    } = body;

    // Validate required fields
    if (!customer_id || !company_name) {
      return NextResponse.json(
        { error: 'customer_id and company_name are required' },
        { status: 400 }
      );
    }

    const result = await pool.query<Customer>(
      `INSERT INTO customers (
        customer_id, company_name, contact_name, contact_title,
        address, city, region, postal_code, country, phone, fax
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        customer_id,
        company_name,
        contact_name,
        contact_title,
        address,
        city,
        region,
        postal_code,
        country,
        phone,
        fax,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);

    // Handle duplicate key error
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Customer ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
