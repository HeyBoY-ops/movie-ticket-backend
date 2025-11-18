import { prisma } from "../server.js";

export const getShows = async (req, res) => {
  const shows = await prisma.show.findMany({
    include: { movie: true, theater: true },
  });
  res.json(shows);
};

export const getShow = async (req, res) => {
  const show = await prisma.show.findUnique({
    where: { id: Number(req.params.id) },
    include: { movie: true, theater: true },
  });
  res.json(show);
};

export const createShow = async (req, res) => {
  const show = await prisma.show.create({
    data: { ...req.body, booked_seats: [] },
  });
  res.json(show);
};

export const updateShow = async (req, res) => {
  const show = await prisma.show.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(show);
};

export const deleteShow = async (req, res) => {
  await prisma.show.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Show deleted" });
};
