Made a basic (but hopefully pretty) options price heatmap
- Making the heatmap was straight forward
- The labels (on the axises) wasn't and designing a sensible gradient legend was harder too
    - Specifically dynamic number generation and positioning
    - The edge case (just 0 on the legend) wasn't too bad but generating step size was trickier
        - Math.ceil(range / (maxTicks - 1)) and then subsequently # of ticks is decided
