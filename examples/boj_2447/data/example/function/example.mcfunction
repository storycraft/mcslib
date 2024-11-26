$data modify storage mcs:system arguments append value [$(arg0)d]
function example:mcslib_n_fn0_v
data remove storage mcs:system arguments[-1]
