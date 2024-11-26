tellraw @s [{"storage": "example:storage", "nbt": "buffer", "interpret": true}]
data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][0]
data modify storage mcs:system registers.r2 set value 1d
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system locals[-1][9] set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][9]
data modify storage mcs:system locals[-1][0] set from storage mcs:system registers.r1
function example:__mcslib_n_fn0_v_b1
