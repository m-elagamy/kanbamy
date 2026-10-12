import {
  RefreshCw,
  SquareCheck,
  PlayCircle,
  Ban,
  TestTube,
  Eye,
  CircleCheck,
  CloudUpload,
  PauseCircle,
  Archive,
  CircleX,
  ThumbsUp,
  CircleAlert,
  CalendarDays,
} from "lucide-react";

const stateOptions = {
  "In Progress": { icon: RefreshCw, color: "#F5A623" },
  Reported: { icon: CircleAlert, color: "#F97316" },
  "To Do": { icon: SquareCheck, color: "#4A90E2" },
  Today: { icon: CalendarDays, color: "#2563EB" },
  "Ready for Development": { icon: PlayCircle, color: "#673AB7" },
  Blocked: { icon: Ban, color: "#F44336" },
  Testing: { icon: TestTube, color: "#FFC107" },
  "Under Review": { icon: Eye, color: "#00BCD4" },
  Done: { icon: CircleCheck, color: "#7ED321" },
  Deployed: { icon: CloudUpload, color: "#3F51B5" },
  "On Hold": { icon: PauseCircle, color: "#9B9B9B" },
  Backlog: { icon: Archive, color: "#9E9E9E" },
  Cancelled: { icon: CircleX, color: "#D32F2F" },
  "Ready for Review": { icon: ThumbsUp, color: "#8BC34A" },
};

export default stateOptions;
