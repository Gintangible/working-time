<template>
	<div class="working-container">
		<div class="working-title">今天你划水了吗？</div>
		<el-row :gutter="20">
			<el-form ref="workingForm" :rules="workRules" inline :model="workForm" label-width="82px">
				<el-row>
					<el-col :span="5">
						<el-form-item label="工作时长:" prop="workTime">{{workForm.workTime}}</el-form-item>
					</el-col>
					<el-col :span="5">
						<el-form-item label="所需时长:">
							<el-select class="workneedDiv" v-model="workForm.workTimeNeed">
								<el-option v-for="time in workNeededList" :key="time" :label="time" :value="time"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="14">
						<el-form-item label="当前人:" prop="curName">
							<el-select v-model="workForm.curName">
								<el-option label="全部" value="all"></el-option>
								<el-option v-for="name in nameList" :key="name" :label="name" :value="name"></el-option>
							</el-select>
						</el-form-item>
						<el-button type="primary" @click="handleQuery">查询</el-button>
						<el-button type="primary" @click="handleCalculate">计算</el-button>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="上班时间:" prop="startTime">
							<el-time-select
								editable
								placeholder="上班时间"
								v-model="workForm.startTime"
								@change="handleWorkTime"
								:picker-options="{
								start: '8:00',
								end: '9:00'
							}"
							></el-time-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="下班时间:" prop="endTime">
							<el-time-select
								editable
								placeholder="下班时间"
								@change="handleWorkTime"
								v-model="workForm.endTime"
								:picker-options="{
								start: '17:30',
								end: '18:00'
							}"
							></el-time-select>
						</el-form-item>
					</el-col>
				</el-row>

				<el-row>
					<el-col :span="12">
						<el-form-item label="午休时间:">
							<el-time-picker
								editable
								is-range
								arrow-control
								@change="handleWorkTime"
								format="HH:mm"
								value-format="HH:mm"
								v-model="workForm.resetTime"
								range-separator="至"
								start-placeholder="开始时间"
								end-placeholder="结束时间"
							></el-time-picker>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="晚饭时间:">
							<el-time-picker
								editable
								is-range
								arrow-control
								format="HH:mm"
								value-format="HH:mm"
								v-model="workForm.dinnerTime"
								range-separator="至"
								start-placeholder="开始时间"
								end-placeholder="结束时间"
							></el-time-picker>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-row>

		<el-row class="working-data">
			<el-table border :data="currentData" style="width: 100%">
				<el-table-column align="center" type="index" :index="handleCurrentIndex" label="序号" width="80"></el-table-column>
				<el-table-column align="center" prop="name" label="姓名"></el-table-column>
				<el-table-column align="center" prop="date" label="日期"></el-table-column>
				<el-table-column align="center" prop="startTime" label="上班打卡"></el-table-column>
				<el-table-column align="center" prop="endTime" label="下班打卡"></el-table-column>
			</el-table>
		</el-row>
		<el-row class="working-pagenation">
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="currentPage"
				:page-sizes="[5, 10, 20, 50]"
				:page-size="100"
				layout="total, sizes, prev, pager, next, jumper"
				:total="showWorkData.length"
			></el-pagination>
		</el-row>
		<el-row class="working-footer">
			<el-button type="primary" @click="handleUpload">导入数据</el-button>
		</el-row>
		<el-dialog title="导入数据" :visible.sync="uploadShow">
			<el-upload
				action
				:auto-upload="false"
				:multiple="false"
				:show-file-list="false"
				accept="csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				:on-change="handleImportData"
			>
				<el-button size="small" type="primary">点击上传</el-button>
			</el-upload>
		</el-dialog>
	</div>
</template>

<script>
import XLSX from 'xlsx';

const exlObj = {
	姓名: 'name',
	日期: 'date',
	上班时间: 'startTime',
	下班时间: 'endTime'
};

export default {
	name: 'home',
	data() {
		return {
			workNeededList: [8, 8.5, 9],
			workForm: {
				workTimeNeed: 8.5,
				curName: 'all',
				startTime: '08:00',
				workTime: 8,
				endTime: '17:30',
				resetTime: ['12:00', '13:30'],
				dinnerTime: ['17:30', '18:00']
			},
			// 姓名集合
			nameList: [],
			// 传入数据
			workData: [],
			// 显示的所有数据
			currentData: [],
			// 显示的数据
			showWorkData: [],
			// 当前页
			currentPage: 1,
			// 显示数据条数
			showLines: 5,
			// 数据格式化
			normalizeWorkData: {},
			workRules: {
				workTimeNeed: [
					{
						type: 'string',
						required: true
					}
				],
				curName: [
					{
						type: 'string',
						required: true
					}
				],
				startTime: [
					{
						type: 'string',
						required: true,
						message: '请输入上班时间'
					}
				],
				endTime: [
					{
						type: 'string',
						required: true,
						message: '请输入下班时间'
					}
				]
			},
			uploadShow: false
		};
	},

	methods: {
		handleGetMinutes(timeStr) {
			if (!timeStr) return 0;
			let timeAry = timeStr.split(':');

			return +timeAry[0] * 60 + +timeAry[1];
		},
		handleWorkTime() {
			const startTime = this.workForm.startTime;
			const endTime = this.workForm.endTime;
			const resetTime = this.workForm.resetTime;
			let resetMinutes = 0;

			if (Array.isArray(resetTime)) {
				resetMinutes =
					this.handleGetMinutes(resetTime[1]) -
					this.handleGetMinutes(resetTime[0]);
			}

			const workMinutes =
				this.handleGetMinutes(endTime) -
				this.handleGetMinutes(startTime);
			this.workForm.workTime = (workMinutes - resetMinutes) / 60;
		},
		handleUpload() {
			this.uploadShow = true;
		},
		formatTimeDate(numb, format = '-') {
			const time = new Date((numb - 1) * 24 * 3600000 + 1);
			time.setYear(time.getFullYear() - 70);
			const year = time.getFullYear() + '';
			const month = time.getMonth() + 1 + '';
			const date = time.getDate() - 1 + '';
			if (format && format.length === 1) {
				return year + format + month + format + date;
			}
			return (
				year +
				(month < 10 ? '0' + month : month) +
				(date < 10 ? '0' + date : date)
			);
		},
		formatImportDate(data) {
			let dataAry = [];
			data.forEach(item => {
				let formatData = {};
				for (let key in item) {
					const exlVal = exlObj[key];
					if (exlVal && exlVal != 'date') {
						formatData[exlVal] = item[key];
					}
					if (exlVal == 'date') {
						formatData[exlVal] = this.formatTimeDate(item[key]);
					}
					dataAry.push(formatData);
				}
			});
			this.showWorkData = dataAry;
			this.handleFormatWorkData();
			this.handleNormalizeWorkData();
		},
		handleImportData(file) {
			const fileReader = new FileReader();
			fileReader.onload = ev => {
				try {
					const data = ev.target.result;
					const workbook = XLSX.read(data, {
						type: 'binary' // 以字符编码的方式解析
					});
					let sheet = Object.keys(workbook.Sheets)[0];
					const jsonData = XLSX.utils.sheet_to_json(
						workbook.Sheets[sheet]
					); //获得以第一列为键名的sheet数组对象
					this.formatImportDate(jsonData);
				} catch (e) {
					console.log(e);
				}
			};
			fileReader.readAsBinaryString(file.raw);
		},
		handleNormalizeWorkData() {
			let nameList = [];
			let normalizeWorkData = {};

			this.workData.forEach(data => {
				const curName = data.name;

				if (!curName) return;
				if (normalizeWorkData[curName]) {
					normalizeWorkData[curName].push(data);
					return;
				}
				normalizeWorkData[curName] = [data];
				nameList.push(curName);
			});

			this.nameList = nameList;
			this.normalizeWorkData = normalizeWorkData;
		},
		handleFormatWorkData() {
			this.currentData = this.showWorkData.slice(
				(this.currentPage - 1) * this.showLines,
				this.currentPage * this.showLines
			);
		},
		handleQuery() {
			const name = this.workForm.curName;
			this.currentPage = 1;
			this.showWorkData =
				name !== 'all' ? this.normalizeWorkData[name] : this.workData;
			this.handleFormatWorkData();
		},
		validate() {
			let isVaild = false;

			this.$refs.workingForm.validate(valid => {
				if (valid) {
					isVaild = true;
				} else {
					isVaild = false;
				}
			});

			return isVaild;
		},
		handleCalculate() {
			if (!this.validate()) return;
			const showData = this.normalizeWorkData[this.workForm.curName];

			this.$router.push({
				name: 'calculate-result',
				params: {
					workInfo: this.workForm,
					data: showData || this.normalizeWorkData
				}
			});
		},
		handleCurrentIndex(index) {
			return (this.currentPage - 1) * this.showLines + index + 1;
		},
		handleCurrentChange(curPage) {
			this.currentPage = curPage;
			this.handleFormatWorkData();
		},
		handleSizeChange(lines) {
			this.showLines = lines;
			this.handleFormatWorkData();
		}
	}
};
</script>
<style lang='scss' scoped>
.working-container {
	margin: auto;
	width: 80%;
	.working-title {
		margin: 20px 0;
		font-size: 36px;
		text-align: center;
	}
	.workneedDiv {
		width: 90px;
	}
	.working-pagenation {
		text-align: right;
	}
	.working-footer {
		margin-top: 20px;
		text-align: center;
	}
}
</style>