data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].a0
function mcs_intrinsic:neg with storage mcs:system registers
data modify storage mcs:system registers.r2 set value 2d
function mcs_intrinsic:div with storage mcs:system registers
data modify storage mcs:system stack[-1].l1 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].a1
function mcs_intrinsic:neg with storage mcs:system registers
data modify storage mcs:system registers.r2 set value 2d
function mcs_intrinsic:div with storage mcs:system registers
data modify storage mcs:system stack[-1].l3 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set value 0d
data modify storage mcs:system stack[-1].l0 set from storage mcs:system registers.r1
function example:__mcslib_nnn_fn2_v_b1
