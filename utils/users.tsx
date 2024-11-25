//utils/users.tsx
import pool from '../utils/db';
import bcrypt from 'bcrypt';

interface Users {
    id: number;
    username: string;
    password: string;
}

export const createUser = async (user: Users) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [user.username, hashedPassword]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const authenticateUser = async ({ authuser }: { authuser: Users }) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [authuser.username]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(authuser.password, user.password)) {
      return user;
    } else {
      return null;
    }
  } finally {
    client.release();
  }
};
