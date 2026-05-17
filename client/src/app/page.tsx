'use client';

import styles from "./page.module.css";
import { Button, Typography, Container, Box } from "@mui/material";
import { motion } from "framer-motion"; // Added framer-motion import
import { useRouter } from "next/navigation"; // Added useRouter import

export default function Home() {
  const router = useRouter(); // Initialized useRouter hook
  return (
    <Container maxWidth="lg">
      <Box sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        py: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.02em',
              mb: 3
            }}
          >
            Опануйте <span className="gradient-text">C++</span> як профі
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 700, mb: 6, fontSize: '1.25rem', lineHeight: 1.6 }}
          >
            Найсучасніша платформа для вивчення C++. Вирішуйте інтерактивні завдання та будуйте свою кар'єру розробника.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
              }}
            >
              Увійти
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/register')}
              sx={{ px: 6, borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'primary.main' } }}
            >
              Зареєструватися
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
}
