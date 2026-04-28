export const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

export const formatScoreLabel = (score) => {
  if (score >= 85) {
    return "Excellent";
  }
  if (score >= 70) {
    return "Strong";
  }
  if (score >= 55) {
    return "Promising";
  }
  return "Needs work";
};

export const scoreTone = (score) => {
  if (score >= 85) {
    return "text-emerald-600";
  }
  if (score >= 70) {
    return "text-tide";
  }
  if (score >= 55) {
    return "text-amber-600";
  }
  return "text-rose-600";
};

