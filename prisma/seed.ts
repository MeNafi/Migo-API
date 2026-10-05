import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Role, UserStatus } from "../generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || "" });
const prisma = new PrismaClient({ adapter });

const PASSWORD = {
  superAdmin: "SuperAdmin@123",
  admin: "Admin@123",
  passenger: "Passenger@123",
  commuter: "Commuter@123",
};

const hash = (plain: string) => bcrypt.hash(plain, 10);

async function upsertUser(input: {
  email: string;
  phone: string;
  role: Role;
  password: string;
  fullName: string;
  status?: UserStatus;
}) {
  const passwordHash = await hash(input.password);
  return prisma.user.upsert({
    where: { email: input.email },
    update: { passwordHash, role: input.role, status: input.status || "ACTIVE" },
    create: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
      status: input.status || "ACTIVE",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: input.fullName,
          preferredLanguage: "en",
          ratingAverage: input.role === "COMMUTER" ? 4.8 : 4.6,
          ratingCount: 12,
          completedRides: 18,
        },
      },
    },
  });
}

async function main() {
  console.log("Seeding Migo…");

  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rideEvent.deleteMany();
  await prisma.rideLocation.deleteMany();
  await prisma.ridePassenger.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.rideMatch.deleteMany();
  await prisma.rideRequest.deleteMany();
  await prisma.routeAvailability.deleteMany();
  await prisma.routeSchedule.deleteMany();
  await prisma.commuterRoute.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.auditLog.deleteMany();

  const superAdmin = await upsertUser({
    email: "superadmin@migo.app",
    phone: "01710000001",
    role: "SUPER_ADMIN",
    password: PASSWORD.superAdmin,
    fullName: "Migo Super Admin",
  });
  const admin = await upsertUser({
    email: "admin@migo.app",
    phone: "01710000002",
    role: "ADMIN",
    password: PASSWORD.admin,
    fullName: "Sadia Rahman",
  });
  const nabila = await upsertUser({
    email: "nabila@migo.app",
    phone: "01710000011",
    role: "PASSENGER",
    password: PASSWORD.passenger,
    fullName: "Nabila Hasan",
  });
  const rahim = await upsertUser({
    email: "rahim@migo.app",
    phone: "01710000012",
    role: "PASSENGER",
    password: PASSWORD.passenger,
    fullName: "Rahim Uddin",
  });
  const passenger = await upsertUser({
    email: "passenger@migo.app",
    phone: "01710000013",
    role: "PASSENGER",
    password: PASSWORD.passenger,
    fullName: "Demo Passenger",
  });
  const karim = await upsertUser({
    email: "karim@migo.app",
    phone: "01710000021",
    role: "COMMUTER",
    password: PASSWORD.commuter,
    fullName: "Karim Chowdhury",
  });
  const ayesha = await upsertUser({
    email: "ayesha@migo.app",
    phone: "01710000022",
    role: "COMMUTER",
    password: PASSWORD.commuter,
    fullName: "Ayesha Khan",
  });
  const commuter = await upsertUser({
    email: "commuter@migo.app",
    phone: "01710000023",
    role: "COMMUTER",
    password: PASSWORD.commuter,
    fullName: "Demo Commuter",
  });

  const toyota = await prisma.vehicle.upsert({
    where: { registrationNo: "DHAKA-METRO-GA-1234" },
    update: {},
    create: {
      ownerId: karim.id,
      type: "CAR",
      make: "Toyota",
      model: "Axio",
      color: "Silver",
      registrationNo: "DHAKA-METRO-GA-1234",
      year: 2018,
      seats: 3,
      verificationStatus: "APPROVED",
    },
  });
  const allion = await prisma.vehicle.upsert({
    where: { registrationNo: "DHAKA-METRO-CHA-7788" },
    update: {},
    create: {
      ownerId: ayesha.id,
      type: "CAR",
      make: "Toyota",
      model: "Allion",
      color: "White",
      registrationNo: "DHAKA-METRO-CHA-7788",
      year: 2020,
      seats: 2,
      verificationStatus: "PENDING",
    },
  });
  await prisma.vehicle.upsert({
    where: { registrationNo: "DHAKA-METRO-GA-9090" },
    update: {},
    create: {
      ownerId: commuter.id,
      type: "CAR",
      make: "Honda",
      model: "Grace",
      color: "Navy",
      registrationNo: "DHAKA-METRO-GA-9090",
      year: 2019,
      seats: 3,
      verificationStatus: "APPROVED",
    },
  });

  await prisma.verification.deleteMany({ where: { vehicleId: { in: [toyota.id, allion.id] } } });
  await prisma.verification.createMany({
    data: [
      {
        userId: karim.id,
        vehicleId: toyota.id,
        type: "VEHICLE",
        status: "APPROVED",
        documentUrls: ["https://files.migo.local/docs/karim-reg.pdf"],
        reviewerId: admin.id,
        reviewedAt: new Date(),
      },
      {
        userId: ayesha.id,
        vehicleId: allion.id,
        type: "VEHICLE",
        status: "PENDING",
        documentUrls: ["https://files.migo.local/docs/ayesha-reg.pdf"],
      },
    ],
  });

  await prisma.commuterRoute.deleteMany({
    where: { ownerId: { in: [karim.id, ayesha.id, commuter.id] } },
  });

  const gulshanMotijheel = await prisma.commuterRoute.create({
    data: {
      ownerId: karim.id,
      vehicleId: toyota.id,
      title: "Gulshan → Motijheel morning",
      originName: "Gulshan 1 Circle, Dhaka",
      originLat: 23.7806,
      originLng: 90.4167,
      destinationName: "Motijheel Shapla Chattar, Dhaka",
      destinationLat: 23.733,
      destinationLng: 90.4172,
      distanceKm: 8.4,
      durationMin: 35,
      seats: 3,
      contributionBdt: 80,
      status: "ACTIVE",
      schedules: {
        create: { daysOfWeek: [1, 2, 3, 4, 5], departureTime: "08:00", returnTime: "18:30" },
      },
    },
  });
  const motijheelGulshan = await prisma.commuterRoute.create({
    data: {
      ownerId: karim.id,
      vehicleId: toyota.id,
      title: "Motijheel → Gulshan evening",
      originName: "Motijheel Shapla Chattar, Dhaka",
      originLat: 23.733,
      originLng: 90.4172,
      destinationName: "Gulshan 1 Circle, Dhaka",
      destinationLat: 23.7806,
      destinationLng: 90.4167,
      distanceKm: 8.4,
      durationMin: 40,
      seats: 3,
      contributionBdt: 80,
      status: "ACTIVE",
      schedules: {
        create: { daysOfWeek: [1, 2, 3, 4, 5], departureTime: "18:30" },
      },
    },
  });
  const uttaraBanani = await prisma.commuterRoute.create({
    data: {
      ownerId: ayesha.id,
      vehicleId: allion.id,
      title: "Uttara → Banani morning",
      originName: "Uttara Sector 7, Dhaka",
      originLat: 23.8759,
      originLng: 90.3795,
      destinationName: "Banani 11, Dhaka",
      destinationLat: 23.7937,
      destinationLng: 90.4043,
      distanceKm: 11.2,
      durationMin: 40,
      seats: 2,
      contributionBdt: 70,
      status: "ACTIVE",
      schedules: {
        create: { daysOfWeek: [1, 2, 3, 4, 5], departureTime: "08:30" },
      },
    },
  });
  await prisma.commuterRoute.create({
    data: {
      ownerId: commuter.id,
      title: "Mirpur 10 → Farmgate",
      originName: "Mirpur 10, Dhaka",
      originLat: 23.8069,
      originLng: 90.3687,
      destinationName: "Farmgate, Dhaka",
      destinationLat: 23.7561,
      destinationLng: 90.39,
      distanceKm: 7.1,
      durationMin: 30,
      seats: 3,
      contributionBdt: 60,
      status: "ACTIVE",
      schedules: {
        create: { daysOfWeek: [0, 1, 2, 3, 4, 5, 6], departureTime: "09:00" },
      },
    },
  });

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  await prisma.rideRequest.deleteMany({
    where: { passengerId: { in: [nabila.id, rahim.id, passenger.id] } },
  });

  const nabilaRequest = await prisma.rideRequest.create({
    data: {
      passengerId: nabila.id,
      pickupName: "Banani 11, Dhaka",
      pickupLat: 23.7937,
      pickupLng: 90.4043,
      destinationName: "Motijheel, Dhaka",
      destinationLat: 23.733,
      destinationLng: 90.4172,
      date: tomorrow,
      time: "08:10",
      seats: 1,
      status: "MATCHED",
    },
  });

  const match = await prisma.rideMatch.create({
    data: {
      requestId: nabilaRequest.id,
      routeId: gulshanMotijheel.id,
      score: 0.86,
      routeSimilarity: 0.9,
      pickupProximity: 0.78,
      destProximity: 0.95,
      timeCompatibility: 0.88,
      scheduleOverlap: 1,
      estimatedPickupKm: 1.8,
      estimatedDestKm: 0.4,
      contributionBdt: 80,
      status: "REQUESTED",
    },
  });

  const pendingRide = await prisma.ride.create({
    data: {
      requestId: nabilaRequest.id,
      matchId: match.id,
      routeId: gulshanMotijheel.id,
      commuterId: karim.id,
      status: "REQUESTED",
      date: tomorrow,
      departureTime: "08:00",
      seats: 1,
      contributionBdt: 80,
      otpCode: "246810",
      passengers: {
        create: {
          passengerId: nabila.id,
          seats: 1,
          pickupName: nabilaRequest.pickupName,
          pickupLat: nabilaRequest.pickupLat,
          pickupLng: nabilaRequest.pickupLng,
          dropName: nabilaRequest.destinationName,
          dropLat: nabilaRequest.destinationLat,
          dropLng: nabilaRequest.destinationLng,
        },
      },
      timeline: { create: { type: "REQUESTED", actorId: nabila.id } },
    },
  });
  await prisma.conversation.create({
    data: {
      rideId: pendingRide.id,
      participantA: nabila.id,
      participantB: karim.id,
      messages: {
        create: {
          senderId: nabila.id,
          content: "Hi Karim, I can wait at Banani 11 near the water tank.",
        },
      },
    },
  });

  const completedRide = await prisma.ride.create({
    data: {
      routeId: motijheelGulshan.id,
      commuterId: karim.id,
      status: "COMPLETED",
      date: yesterday,
      departureTime: "18:30",
      seats: 1,
      contributionBdt: 80,
      startedAt: yesterday,
      completedAt: yesterday,
      passengers: {
        create: { passengerId: rahim.id, seats: 1, pickupName: "Motijheel", dropName: "Gulshan 1" },
      },
      timeline: {
        create: [
          { type: "REQUESTED", actorId: rahim.id },
          { type: "ACCEPTED", actorId: karim.id },
          { type: "COMPLETED", actorId: karim.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      rideId: completedRide.id,
      payerId: rahim.id,
      amount: 80,
      status: "SUCCESS",
      method: "bKash",
      tranId: "MIGO-SEED-PAID-001",
      paidAt: yesterday,
    },
  });
  await prisma.review.create({
    data: {
      rideId: completedRide.id,
      authorId: rahim.id,
      targetId: karim.id,
      rating: 5,
      comment: "On time and very polite. Smooth commute.",
    },
  });

  await prisma.report.create({
    data: {
      reporterId: nabila.id,
      category: "SAFETY",
      description: "Demo report for admin queue.",
      status: "OPEN",
    },
  });
  await prisma.supportTicket.create({
    data: {
      userId: rahim.id,
      subject: "Need invoice for last ride",
      category: "PAYMENTS",
      description: "Please send a contribution receipt for yesterday's commute.",
    },
  });
  await prisma.notification.createMany({
    data: [
      {
        userId: karim.id,
        type: "RIDE_REQUEST",
        title: "New ride request",
        body: "Nabila requested to join Gulshan → Motijheel.",
        data: { rideId: pendingRide.id },
      },
      {
        userId: nabila.id,
        type: "SYSTEM",
        title: "Welcome to Migo",
        body: "Find a daily commute that already goes your way.",
      },
    ],
  });
  await prisma.systemSetting.upsert({
    where: { key: "match_weights" },
    update: {},
    create: {
      key: "match_weights",
      value: {
        routeSimilarity: 0.4,
        pickupProximity: 0.2,
        destProximity: 0.15,
        timeCompatibility: 0.15,
        scheduleOverlap: 0.1,
      },
    },
  });

  console.log("Seed complete.");
  console.log("------------------------------------------------");
  console.log("Postman login accounts");
  console.log("Super Admin  superadmin@migo.app   SuperAdmin@123");
  console.log("Admin        admin@migo.app        Admin@123");
  console.log("Passenger    nabila@migo.app       Passenger@123");
  console.log("Passenger    rahim@migo.app        Passenger@123");
  console.log("Passenger    passenger@migo.app    Passenger@123");
  console.log("Commuter     karim@migo.app        Commuter@123");
  console.log("Commuter     ayesha@migo.app       Commuter@123");
  console.log("Commuter     commuter@migo.app     Commuter@123");
  console.log("Pending ride OTP (Nabila × Karim): 246810");
  console.log("Pending ride id:", pendingRide.id);
  console.log("------------------------------------------------");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
