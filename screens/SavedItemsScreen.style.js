import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  container: { flex: 1, padding: 20,  marginTop: 50, backgroundColor: '#252222ff' },
  input: { marginBottom: 10, borderBottomWidth: 1, padding: 8 },
  item: { marginBottom: 12, padding: 10, borderBottomWidth: 0.5 },
  name: { fontSize: 16,    color: '#fff',},
  name_search : {fontSize:16,     color : '#000000ff',},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 6, // optional, if supported
    fontWeight: '100',
},
  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: 'white', padding: 40, borderRadius: 10, width: '90%',
    maxHeight: '80%',
  },
  
  listItemSearch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  roundButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  
  listItem: {
    flexDirection: 'column',
    marginTop: 5,
    alignItems: 'center',
  },


  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  filterContainer: {
    padding: 10,
    backgroundColor: '#252222ff',
    borderBottomWidth: 1,
    borderBottomColor: '#252222ff',
  },
  filterInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  categoryChips: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#4CAF50',
  },
  chipText: {
    fontSize: 13,
    color: '#333',
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryBadge: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,
  },
  nutritionLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  nutritionValue: {
    color: '#666',
    fontSize: 14,
  },
  modifyScrollView: {
    maxHeight: 400,
  },
  modifySectionContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modifySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryChipsModify: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
});


