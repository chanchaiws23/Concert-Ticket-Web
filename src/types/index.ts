export interface User {
    id: number;
    email: string;
    role: 'USER' | 'ORGANIZER' | 'ADMIN';
    name: string;
    lastname:string;
    organizerId?: number;
  }
  
  export interface TicketType {
    id: number;
    name: string;
    price: number;
    total_quantity: number;
    sold_quantity: number;
  }
  
  export interface EventData {
    id: number;
    title: string;
    description: string;
    venue: string;
    event_date: string;
    poster_url: string;
    ticket_types?: TicketType[];
  }
  
  export interface OrderItem {
    name: string;
    qty: number;
  }
  
  export interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
  }