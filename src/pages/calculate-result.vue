<template>
	<div class="result-container">
		<div class="result-title">{{workInfo.curName}}的工作详情</div>
		<el-table border :data="resultData" style="width: 100%">
			<el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
			<el-table-column align="center" prop="name" label="姓名"></el-table-column>
			<el-table-column align="center" prop="days" label="天数"></el-table-column>
			<el-table-column align="center" prop="workTime" label="平均工时"></el-table-column>
			<el-table-column align="center" label="所需工时">{{workInfo.workTimeNeed}}</el-table-column>
			<el-table-column align="center" label="备注">
				<template slot-scope="scope">
					{{scope.row.extra > 0 ? '超过' : '还欠'}}
					<span style="color:#f00;">{{Math.abs(scope.row.extra)}}</span> h
				</template>
			</el-table-column>
		</el-table>
		<el-row class="result-footer">
			<el-button type="primary" @click="back">返回</el-button>
		</el-row>
	</div>
</template>

<script>
export default {
	name: 'calculate-result',
	data() {
		const detailData = this.$route.params.data;
		const workInfo = this.$route.params.workInfo;

		if (!workInfo) {
			this.back();
			return;
		}
		return {
			detailData,
			workInfo,
			resultData: []
		};
	},

	created() {
		this.handleCalcData();
	},

	components: {},

	computed: {},

	methods: {
		getMinutes(timeStr) {
			if (!timeStr) return 0;
			let timeAry = timeStr.split(':');

			return +timeAry[0] * 60 + +timeAry[1];
		},
		handleCalcData() {
			if (Array.isArray(this.detailData)) {
				this.handleCalc(this.workInfo.curName, this.detailData);
				return;
			}

			Object.keys(this.detailData).forEach(name => {
				this.handleCalc(name, this.detailData[name]);
			});
		},

		getStartTime(time) {
			const earlyWork = this.workInfo.startTime;
			const morningTime =
				this.getMinutes(time) - this.getMinutes(earlyWork);

			return morningTime > 0 ? morningTime : 0;
		},

		getEndTime(time) {
			const lastWork = this.workInfo.endTime;
			const dinnerTime = this.workInfo.dinnerTime;
			const endTime = this.getMinutes(time);

			if (dinnerTime) {
				if (endTime < dinnerTime[1]) {
					return 0;
				}
				return endTime - this.getMinutes(dinnerTime[1]);
			}

			return endTime - this.getMinutes(lastWork);
		},

		getDayTime(starttime, endtime) {
			return (
				(this.getEndTime(endtime) - this.getStartTime(starttime)) / 60 +
				this.workInfo.workTime
			);
		},
		handleCalc(name, detailAry) {
			let dayTime = 0;
			const days = detailAry.length;

			detailAry.forEach(item => {
				dayTime += this.getDayTime(item.startTime, item.endTime);
			});

			this.resultData.push({
				name: name,
				days,
				workTime: dayTime / days,
				extra: dayTime - this.workInfo.workTimeNeed * days
			});
		},
		back() {
			this.$router.go(-1);
		}
	}
};
</script>
<style lang='scss' scoped>
.result-container {
	margin: auto;
	width: 80%;
	.result-title {
		margin: 20px 0;
		font-size: 36px;
		text-align: center;
	}
	.result-footer {
		margin-top: 20px;
		text-align: center;
	}
}
</style>