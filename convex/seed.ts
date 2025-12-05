import { mutation } from "./_generated/server";

const sampleClients = [
  {
    name: "Acme Corporation",
    address: "123 Main Street, New York, NY 10001",
    sicCode: "7371",
    sicDescription: "Computer Programming Services",
    employeeCount: 250,
  },
  {
    name: "TechStart Solutions",
    address: "456 Innovation Drive, San Francisco, CA 94102",
    sicCode: "7372",
    sicDescription: "Prepackaged Software",
    employeeCount: 85,
  },
  {
    name: "Global Manufacturing Inc",
    address: "789 Industrial Blvd, Chicago, IL 60601",
    sicCode: "3089",
    sicDescription: "Plastics Products, Not Elsewhere Classified",
    employeeCount: 1200,
  },
  {
    name: "Healthcare Partners LLC",
    address: "321 Medical Center Way, Boston, MA 02115",
    sicCode: "8011",
    sicDescription: "Offices and Clinics of Doctors of Medicine",
    employeeCount: 450,
  },
  {
    name: "Financial Services Group",
    address: "555 Wall Street, New York, NY 10005",
    sicCode: "6211",
    sicDescription: "Security Brokers, Dealers, and Flotation Companies",
    employeeCount: 320,
  },
  {
    name: "Retail Dynamics Co",
    address: "888 Commerce Avenue, Los Angeles, CA 90001",
    sicCode: "5311",
    sicDescription: "Department Stores",
    employeeCount: 1800,
  },
  {
    name: "Energy Systems Ltd",
    address: "222 Power Plant Road, Houston, TX 77001",
    sicCode: "4911",
    sicDescription: "Electric Services",
    employeeCount: 950,
  },
  {
    name: "Construction Masters",
    address: "777 Builder Lane, Phoenix, AZ 85001",
    sicCode: "1521",
    sicDescription: "General Contractors-Single-Family Houses",
    employeeCount: 150,
  },
  {
    name: "Food & Beverage Corp",
    address: "444 Culinary Street, Portland, OR 97201",
    sicCode: "2086",
    sicDescription: "Bottled and Canned Soft Drinks and Carbonated Waters",
    employeeCount: 600,
  },
  {
    name: "Transportation Logistics",
    address: "999 Freight Way, Atlanta, GA 30301",
    sicCode: "4213",
    sicDescription: "Trucking, Except Local",
    employeeCount: 420,
  },
  {
    name: "Real Estate Holdings",
    address: "111 Property Row, Miami, FL 33101",
    sicCode: "6531",
    sicDescription: "Real Estate Agents and Managers",
    employeeCount: 180,
  },
  {
    name: "Media Productions Inc",
    address: "333 Studio Boulevard, Los Angeles, CA 90028",
    sicCode: "7812",
    sicDescription: "Motion Picture and Video Tape Production",
    employeeCount: 275,
  },
  {
    name: "Education Services",
    address: "666 Learning Lane, Seattle, WA 98101",
    sicCode: "8299",
    sicDescription:
      "Schools and Educational Services, Not Elsewhere Classified",
    employeeCount: 95,
  },
  {
    name: "Pharmaceutical Research",
    address: "777 Lab Drive, Philadelphia, PA 19101",
    sicCode: "2834",
    sicDescription: "Pharmaceutical Preparations",
    employeeCount: 1100,
  },
  {
    name: "Automotive Solutions",
    address: "888 Car Avenue, Detroit, MI 48201",
    sicCode: "3714",
    sicDescription: "Motor Vehicle Parts and Accessories",
    employeeCount: 750,
  },
  {
    name: "Telecommunications Network",
    address: "555 Signal Street, Dallas, TX 75201",
    sicCode: "4813",
    sicDescription: "Telephone Communications, Except Radiotelephone",
    employeeCount: 520,
  },
  {
    name: "Hospitality Group",
    address: "222 Hotel Plaza, Las Vegas, NV 89101",
    sicCode: "7011",
    sicDescription: "Hotels and Motels",
    employeeCount: 680,
  },
  {
    name: "Agricultural Products",
    address: "111 Farm Road, Des Moines, IA 50301",
    sicCode: "0111",
    sicDescription: "Wheat",
    employeeCount: 340,
  },
  {
    name: "Legal Services Firm",
    address: "444 Court Street, Washington, DC 20001",
    sicCode: "8111",
    sicDescription: "Legal Services",
    employeeCount: 125,
  },
  {
    name: "Environmental Solutions",
    address: "777 Green Way, Denver, CO 80201",
    sicCode: "4953",
    sicDescription: "Refuse Systems",
    employeeCount: 210,
  },
];

export const seedClients = mutation({
  args: {},
  handler: async (ctx) => {
    const existingClients = await ctx.db.query("clients").collect();
    if (existingClients.length > 0) {
      return {
        message: "Clients already seeded",
        count: existingClients.length,
      };
    }

    for (const client of sampleClients) {
      await ctx.db.insert("clients", client);
    }

    return { message: "Seeded 20 clients", count: sampleClients.length };
  },
});
