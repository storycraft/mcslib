# -1: local y
# -2: local x
# -3: arg n

# print line
tellraw @s [{"storage": "example:storage", "nbt": "buffer", "interpret": true}]

# load y in r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1]
# load 1 in r2
data modify storage mcs:system registers.r2 set value 1d
# add y + 1
function mcs_intrinsic:add with storage mcs:system registers
# store result to y
data modify storage mcs:system stack[-1] set from storage mcs:system registers.r1
# jump to branch 1
return run function example:draw_star_b1