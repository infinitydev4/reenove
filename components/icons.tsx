import {
  Hammer,
  Wrench,
  Zap,
  Paintbrush,
  Shovel,
  Layout,
  LucideIcon,
  LucideProps
} from "lucide-react"
import { ComponentType } from "react"

export type Icon = LucideIcon

export const Icons = {
  hammer: Hammer,
  wrench: Wrench,
  zap: Zap,
  paintbrush: Paintbrush,
  garden: Shovel,
  "brick-wall": ({ ...props }: LucideProps) => (
    <Layout {...props} />
  ),
} 