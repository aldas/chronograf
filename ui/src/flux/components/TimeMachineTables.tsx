// Libraries
import React, {PureComponent} from 'react'

// Components
import TableSidebar from 'src/flux/components/TableSidebar'
import {FluxTable} from 'src/types'
import NoResults from 'src/flux/components/NoResults'
import TableGraph from 'src/shared/components/TableGraph'

// Types
import {QueryUpdateState} from 'src/shared/actions/queries'
import {ColorString} from 'src/types/colors'
import {TableOptions, FieldOption, DecimalPlaces} from 'src/types/dashboards'
import {DataTypes} from 'src/shared/constants'

interface Props {
  data: FluxTable[]
  dataType: DataTypes
  tableOptions: TableOptions
  timeFormat: string
  decimalPlaces: DecimalPlaces
  fieldOptions: FieldOption[]
  handleSetHoverTime?: (hovertime: string) => void
  colors: ColorString[]
  editorLocation?: QueryUpdateState
}

interface State {
  selectedResultID: string | null
}

class TimeMachineTables extends PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      selectedResultID: this.defaultResultId,
    }
  }

  public componentDidUpdate() {
    if (!this.selectedResult) {
      this.setState({selectedResultID: this.defaultResultId})
    }
  }

  public render() {
    const {
      colors,
      dataType,
      timeFormat,
      tableOptions,
      fieldOptions,
      decimalPlaces,
      editorLocation,
      handleSetHoverTime,
    } = this.props
    return (
      <div className="time-machine-tables">
        {this.showSidebar && (
          <TableSidebar
            data={this.props.data}
            selectedResultID={this.state.selectedResultID}
            onSelectResult={this.handleSelectResult}
          />
        )}
        {this.shouldShowTable && (
          <TableGraph
            data={this.selectedResult}
            dataType={dataType}
            colors={colors}
            tableOptions={tableOptions}
            fieldOptions={fieldOptions}
            timeFormat={timeFormat}
            decimalPlaces={decimalPlaces}
            editorLocation={editorLocation}
            handleSetHoverTime={handleSetHoverTime}
          />
        )}
        {!this.hasResults && <NoResults />}
      </div>
    )
  }

  private handleSelectResult = (selectedResultID: string): void => {
    this.setState({selectedResultID})
  }

  private get showSidebar(): boolean {
    return this.props.data.length > 1
  }

  private get hasResults(): boolean {
    return !!this.props.data.length
  }

  private get shouldShowTable(): boolean {
    return !!this.props.data && !!this.selectedResult
  }

  private get defaultResultId() {
    const {data} = this.props

    if (data.length && !!data[0]) {
      return data[0].id
    }

    return null
  }

  private get selectedResult(): FluxTable {
    const selectedTable = this.props.data.find(
      d => d.id === this.state.selectedResultID
    )
    if (selectedTable) {
      return filterTable(selectedTable)
    }
  }
}

const filterTable = (table: FluxTable): FluxTable => {
  const IGNORED_COLUMNS = ['', 'result', 'table', '_start', '_stop']
  const header = table.data[0]
  const indices = IGNORED_COLUMNS.map(name => header.indexOf(name))
  const data = table.data.map(row =>
    row.filter((__, i) => !indices.includes(i))
  )

  return {
    ...table,
    data,
  }
}

export default TimeMachineTables
