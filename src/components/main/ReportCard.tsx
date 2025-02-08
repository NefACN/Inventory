import React from "react";
import { Card, CardContent, Avatar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  route?: string; // Ruta a la que redirigir
}

const ReportCard: React.FC<ReportCardProps> = ({ icon, title, description, route }) => {
  const router = useRouter();

  const handleClick = () => {
    if (route) {
      router.push(route); // Redirigir a la ruta especificada
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        boxShadow: 3,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: 6,
          cursor: "pointer",
        },
      }}
    >
      <Avatar sx={{ bgcolor: "primary.main", color: "white", width: 56, height: 56 }}>
        {icon}
      </Avatar>
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
