# -1: local y
# -2: local x
# -3: arg n

# local y
data modify storage mcs:system stack append value 0d
# local x
data modify storage mcs:system stack append value 0d
# jump to branch 1
return run function example:draw_star_b1