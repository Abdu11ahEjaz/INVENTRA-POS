import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initSQLite = async () => {
  return open({
    filename: process.env.SQLITE_DB,
    driver: sqlite3.Database,
  });
};