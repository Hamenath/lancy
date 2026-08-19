import FreelancerCard from "./FreelancerCard";
import type { Freelancer } from "../types";

export interface DesignerCardProps {
  designer?: any;
  freelancer?: any;
}

export function DesignerCard({ designer, freelancer }: DesignerCardProps) {
  const data = freelancer || designer;
  return <FreelancerCard freelancer={data as Freelancer} />;
}

export default DesignerCard;
export { FreelancerCard };
