import React from "react";
import * as Lucide from "lucide-react";

interface MyIconProps {
  name: string;
  className?: string;
  size?: number;
  fill?: string;
}

export default function MyIcon({ name, className = "", size = 20, fill }: MyIconProps) {
  // Safe mapping of mock names to real Lucide React icons
  const getIconComponent = () => {
    switch (name) {
      case "Music":
        return Lucide.Music;
      case "Baby":
        return Lucide.Baby;
      case "Smile":
        return Lucide.Smile;
      case "Globe":
        return Lucide.Globe;
      case "Zap":
        return Lucide.Zap;
      case "Heart":
        return Lucide.Heart;
      case "Shield":
        return Lucide.Shield;
      case "Users":
        return Lucide.Users;
      case "Sparkles":
        return Lucide.Sparkles;
      case "Tv":
        return Lucide.Tv;
      case "HandsPraying":
        return Lucide.HeartHandshake; // Elegant alternative for prayer/ministry
      case "Gift":
        return Lucide.Gift;
      case "Clock":
        return Lucide.Clock;
      case "Phone":
        return Lucide.Phone;
      case "Mail":
      case "Mail2":
        return Lucide.Mail;
      case "MapPin":
        return Lucide.MapPin;
      case "Sun":
        return Lucide.Sun;
      case "Moon":
        return Lucide.Moon;
      case "Menu":
        return Lucide.Menu;
      case "X":
        return Lucide.X;
      case "Check":
        return Lucide.Check;
      case "Lock":
        return Lucide.Lock;
      case "Trash":
        return Lucide.Trash2;
      case "CheckCircle":
        return Lucide.CheckCircle2;
      case "LockOpen":
        return Lucide.Unlock;
      case "Search":
        return Lucide.Search;
      case "ArrowRight":
        return Lucide.ArrowRight;
      case "ExternalLink":
        return Lucide.ExternalLink;
      case "VideoOff":
        return Lucide.VideoOff;
      case "Timer":
        return Lucide.Timer;
      case "Radio":
        return Lucide.Radio;
      case "Bell":
        return Lucide.Bell;
      case "Play":
        return Lucide.Play;
      case "Star":
        return Lucide.Star;
      case "Calendar":
      case "CalendarDays":
        return Lucide.CalendarDays;
      case "DoorOpen":
        return Lucide.DoorOpen;
      case "AlertCircle":
        return Lucide.AlertCircle;
      case "Send":
        return Lucide.Send;
      default:
        return Lucide.HelpCircle;
    }
  };

  const IconComp = getIconComponent();
  return <IconComp className={className} size={size} fill={fill} />;
}
