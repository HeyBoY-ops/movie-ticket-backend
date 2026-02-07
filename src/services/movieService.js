import prisma from "../config/db.js";

export const createMovie = async (movieData, ownerId) => {
  return await prisma.movie.create({
    data: {
      ...movieData,
      ownerId
    }
  });
};

export const getMoviesByOwner = async (ownerId) => {
  return await prisma.movie.findMany({
    where: { ownerId }
  });
};
