import { prisma } from "../server.js";

export const getShows = async (req, res) => {
  const { movie_id } = req.query;
  const where = movie_id ? { movie_id } : {};
  const shows = await prisma.show.findMany({
    where,
    include: { movie: true, theater: true },
  });
  res.json(shows);
};

export const getShow = async (req, res) => {
  const show = await prisma.show.findUnique({
    where: { id: req.params.id },
    include: { movie: true, theater: true },
  });
  res.json(show);
};

export const createShow = async (req, res) => {
  const { show_date, ...rest } = req.body;
  const show = await prisma.show.create({
    data: {
      ...rest,
      show_date: new Date(show_date),
      booked_seats: [],
    },
  });
  res.json(show);
};

export const updateShow = async (req, res) => {
  const show = await prisma.show.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(show);
};

export const deleteShow = async (req, res) => {
  await prisma.show.delete({ where: { id: req.params.id } });
  res.json({ message: "Show deleted" });
};
