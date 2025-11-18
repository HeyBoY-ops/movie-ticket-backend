import { prisma } from "../server.js";

export const getMovies = async (req, res) => {
  const movies = await prisma.movie.findMany({ orderBy: { id: "desc" } });
  res.json({ movies });
};

export const getMovie = async (req, res) => {
  const movie = await prisma.movie.findUnique({
    where: { id: Number(req.params.id) },
    include: { shows: true },
  });

  if (!movie) return res.status(404).json({ error: "Movie not found" });

  res.json(movie);
};

export const createMovie = async (req, res) => {
  const movie = await prisma.movie.create({ data: req.body });
  res.json(movie);
};

export const updateMovie = async (req, res) => {
  const movie = await prisma.movie.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(movie);
};

export const deleteMovie = async (req, res) => {
  await prisma.movie.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Movie deleted" });
};
