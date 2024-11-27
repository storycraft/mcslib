data modify storage mcs:system locals append value [0d,0d]
data modify storage mcs:system registers.r1 set value 0d
data modify storage mcs:system locals[-1][0] set from storage mcs:system registers.r1
function example:__mcslib_n_fn0_v_b1
