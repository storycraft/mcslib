data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l1
data modify storage mcs:system registers.r2 set value 1d
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l1 set from storage mcs:system registers.r1
function example:__mcslib_n_fn0_v_b3
