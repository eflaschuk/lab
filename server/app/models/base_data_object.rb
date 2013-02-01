class BaseDataObject < CouchRest::Model::Base

  class_attribute :alternate_id_key

  # track imorted (from buld process)
  property :parent_doc_revision, String
  property :from_import,         TrueClass, :default => true


  def self.delete_everything
    self.database.recreate!
  end

  def self.delete_examples
    self.all.select{ |a| a.from_import?}.each {|i| i.destroy }
  end

  def self.delete_all
    self.all.each {|i| i.destroy }
  end

  def self.alternate_id(key)
    self.alternate_id_key = key
  end

  def self.find_matching(hash_def)
    found_by_id = self.find(hash_def['id'])
    return found_by_id unless found_by_id.nil?

    find_key    = hash_def[self.alternate_id_key.to_s]
    find_method = "find_by_#{self.alternate_id_key}".to_sym

    if (find_key && self.respond_to?(find_method))
      return self.send(find_method,find_key)
    end
    return nil
  end

  def self.create_or_update(hash_def)
    found = self.find_matching(hash_def) || self.create(hash_def)
    found.update_attributes(hash_def)
    return found
  end

end
