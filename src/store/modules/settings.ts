// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

@Module({ name: 'settings', namespaced: true })
export default class SettingsModule extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // TODO: add color too
  userName: string = 'noname'
  showImageColors: boolean = true
  isCollaborationActive: boolean = false

  // Mutations (synchronous)
  @Mutation
  setShowImageColors (value: boolean) {
    this.showImageColors = value
  }
  @Mutation
  setIsCollaborationActive (value: boolean) {
    this.isCollaborationActive = value
  }
  @Mutation
  setUserName (userName: string) {
    this.userName = userName
  }

  // Actions (asynchronous)
  @Action
  enableCollaboration () {
    this.setIsCollaborationActive(true)
  }
  @Action
  disableCollaboration () {
    this.setIsCollaborationActive(false)
  }
}
