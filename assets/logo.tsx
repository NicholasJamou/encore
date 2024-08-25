import * as React from "react"
import Svg, { SvgProps, Path, Circle } from "react-native-svg"

interface SvgComponentProps extends SvgProps {
  color?: string;
}

const SvgComponent = ({ color = "#000", ...props }: SvgComponentProps) => (
  <Svg width={24} height={24} viewBox="0 0 200 100" {...props}>
    <Path d="M60 10v80h60V70H80V55h30V35H80V10H60Z" fill={color} />
    <Circle cx={140} cy={50} r={10} fill={color} />
  </Svg>
)

export default SvgComponent