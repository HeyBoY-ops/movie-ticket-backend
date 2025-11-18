import { prisma } from "../server.js";

export const getTheaters = async (req, res) => {
  const theaters = await prisma.theater.findMany();
  res.json(theaters);
};

export const createTheater = async (req, res) => {
  const t = await prisma.theater.create({ data: req.body });
  res.json(t);
};

export const updateTheater = async (req, res) => {
  const t = await prisma.theater.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(t);
};

export const deleteTheater = async (req, res) => {
  await prisma.theater.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Theater deleted" });
};
